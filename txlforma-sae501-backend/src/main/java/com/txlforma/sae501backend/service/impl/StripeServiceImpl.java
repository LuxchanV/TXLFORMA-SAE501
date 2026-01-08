package com.txlforma.sae501backend.service.impl;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.txlforma.sae501backend.dto.stripe.StripeConfirmResponseDto;
import com.txlforma.sae501backend.dto.stripe.StripePaymentIntentResponseDto;
import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import com.txlforma.sae501backend.repository.PaiementRepository;
import com.txlforma.sae501backend.service.InscriptionService;
import com.txlforma.sae501backend.service.PaiementService;
import com.txlforma.sae501backend.service.StripeService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class StripeServiceImpl implements StripeService {

    private final PaiementService paiementService;
    private final PaiementRepository paiementRepository;
    private final InscriptionService inscriptionService;

    @Value("${stripe.currency:eur}")
    private String currency;

    @Value("${stripe.webhookSecret:}")
    private String webhookSecret;

    // ✅ IMPORTANT
    @Value("${stripe.secretKey:}")
    private String secretKey;

    @PostConstruct
    public void initStripe() {
        if (secretKey == null || secretKey.isBlank()) {
            // En prod: tu DOIS fournir stripe.secretKey (ou variable d'env)
            throw new IllegalStateException("stripe.secretKey manquante (Stripe ne peut pas fonctionner).");
        }
        Stripe.apiKey = secretKey;
    }

    @Override
    public StripePaymentIntentResponseDto createPaymentIntentForInscription(Long inscriptionId) {
        // 1) crée/récupère un paiement EN_ATTENTE (idempotent)
        Paiement p = paiementService.creerCheckout(inscriptionId);

        if (p.getStatut() != StatutPaiement.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement déjà traité.");
        }

        long amountCents = toCents(p.getMontant());

        // 2) Si déjà lié à un PI Stripe, on le réutilise
        if (p.getReferenceExterne() != null && p.getReferenceExterne().startsWith("pi_")) {
            try {
                PaymentIntent existing = PaymentIntent.retrieve(p.getReferenceExterne());
                return StripePaymentIntentResponseDto.builder()
                        .paiementId(p.getId())
                        .inscriptionId(p.getInscription().getId())
                        .paymentIntentId(existing.getId())
                        .clientSecret(existing.getClientSecret())
                        .montant(p.getMontant())
                        .formationTitre(getFormationTitre(p))
                        .currency(currency)
                        .build();
            } catch (Exception ignored) {
                // si Stripe répond KO, on recrée un PI proprement ci-dessous
            }
        }

        // 3) Crée PaymentIntent Stripe
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(currency)
                .addPaymentMethodType("card")
                .setDescription("TXL FORMA - inscription " + inscriptionId)
                .putMetadata("paiementId", String.valueOf(p.getId()))
                .putMetadata("inscriptionId", String.valueOf(p.getInscription().getId()))
                .build();

        // 4) Idempotency key => évite double PI si le front spam
        RequestOptions opts = RequestOptions.builder()
                .setIdempotencyKey("txlforma-paiement-" + p.getId())
                .build();

        try {
            PaymentIntent pi = PaymentIntent.create(params, opts);

            p.setModePaiement("STRIPE");
            p.setReferenceExterne(pi.getId());
            paiementRepository.save(p);

            return StripePaymentIntentResponseDto.builder()
                    .paiementId(p.getId())
                    .inscriptionId(p.getInscription().getId())
                    .paymentIntentId(pi.getId())
                    .clientSecret(pi.getClientSecret())
                    .montant(p.getMontant())
                    .formationTitre(getFormationTitre(p))
                    .currency(currency)
                    .build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stripe error: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhook(String payload, String signatureHeader) {
        // ✅ si pas configuré, on ignore (utile en dev)
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return;
        }

        final Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signature webhook invalide.");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> {
                PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (pi != null) applyStripeStatus(pi.getId(), "succeeded");
            }
            case "payment_intent.payment_failed" -> {
                PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (pi != null) applyStripeStatus(pi.getId(), "failed");
            }
            default -> {
                // ignore autres events
            }
        }
    }

    @Override
    public StripeConfirmResponseDto confirmPaymentIntent(String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paymentIntentId manquant.");
        }

        final PaymentIntent pi;
        try {
            pi = PaymentIntent.retrieve(paymentIntentId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stripe retrieve error: " + e.getMessage());
        }

        // status ex: "succeeded", "requires_payment_method", ...
        String status = pi.getStatus();
        applyStripeStatus(paymentIntentId, status);

        Paiement p = paiementRepository.findByReferenceExterneForUpdate(paymentIntentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement lié introuvable."));

        // sécurité : vérifie que l'user courant a accès à cette inscription
        inscriptionService.getInscriptionForCurrentUserOrAdmin(p.getInscription().getId());

        return StripeConfirmResponseDto.builder()
                .paiementId(p.getId())
                .inscriptionId(p.getInscription().getId())
                .paymentIntentStatus(status)
                .paiementStatut(String.valueOf(p.getStatut()))
                .inscriptionStatut(String.valueOf(p.getInscription().getStatut()))
                .build();
    }

    private void applyStripeStatus(String paymentIntentId, String status) {
        Paiement p = paiementRepository.findByReferenceExterneForUpdate(paymentIntentId).orElse(null);
        if (p == null) return;

        // si déjà final => idempotent
        if (p.getStatut() == StatutPaiement.SUCCES || p.getStatut() == StatutPaiement.ECHEC) return;

        p.setModePaiement("STRIPE");
        p.setDatePaiement(LocalDateTime.now());

        if ("succeeded".equalsIgnoreCase(status)) {
            p.setStatut(StatutPaiement.SUCCES);
            p.getInscription().setStatut(StatutInscription.PAYEE);
        } else if ("failed".equalsIgnoreCase(status) || "canceled".equalsIgnoreCase(status)) {
            p.setStatut(StatutPaiement.ECHEC);
        } else {
            // on laisse EN_ATTENTE (ex: requires_action)
            p.setStatut(StatutPaiement.EN_ATTENTE);
        }

        paiementRepository.save(p);
    }

    private long toCents(Double amount) {
        if (amount == null) return 0;
        BigDecimal bd = BigDecimal.valueOf(amount).multiply(BigDecimal.valueOf(100));
        return bd.setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private String getFormationTitre(Paiement p) {
        try {
            return p.getInscription().getSession().getFormation().getTitre();
        } catch (Exception e) {
            return "Formation";
        }
    }
}

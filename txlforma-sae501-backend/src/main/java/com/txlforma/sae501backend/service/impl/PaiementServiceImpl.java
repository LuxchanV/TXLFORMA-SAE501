package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.paiement.PaiementConfirmRequestDto;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.PaiementRepository;
import com.txlforma.sae501backend.service.InscriptionService;
import com.txlforma.sae501backend.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaiementServiceImpl implements PaiementService {

    private final PaiementRepository paiementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final InscriptionService inscriptionService;

    @Override
    public Paiement creerCheckout(Long inscriptionId) {
        // ✅ sécurité (vérifie que c'est bien l'user courant ou admin)
        inscriptionService.getInscriptionForCurrentUserOrAdmin(inscriptionId);

        // ✅ lock inscription (anti double création)
        Inscription ins = inscriptionRepository.findByIdForUpdate(inscriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable"));

        if (ins.getStatut() == StatutInscription.PAYEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inscription déjà payée.");
        }
        if (ins.getStatut() == StatutInscription.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inscription annulée : paiement impossible.");
        }

        // ✅ si déjà un paiement EN_ATTENTE => on le réutilise (idempotence)
        var pending = paiementRepository.findFirstByInscription_IdAndStatutOrderByDatePaiementDesc(
                inscriptionId, StatutPaiement.EN_ATTENTE
        );

        if (pending.isPresent()) {
            // petit nettoyage si plusieurs EN_ATTENTE existent déjà
            nettoyerDoublonsEnAttente(inscriptionId, pending.get().getId());
            return pending.get();
        }

        // ✅ calcule montant depuis la formation
        // (adapte le getter si ton Formation a un autre champ)
        Double montant = ins.getSession().getFormation().getPrix();
        if (montant == null) montant = 0.0;

        Paiement p = Paiement.builder()
                .inscription(ins)
                .montant(montant)
                .statut(StatutPaiement.EN_ATTENTE)
                .modePaiement("CARTE_TEST")
                .datePaiement(LocalDateTime.now())
                .referenceExterne("CO_TEST_" + UUID.randomUUID())
                .build();

        return paiementRepository.save(p);
    }

    @Override
    public Paiement confirmerCheckout(Long paiementId, PaiementConfirmRequestDto dto) {
        // ✅ lock paiement (anti double-confirm simultané)
        Paiement p = paiementRepository.findByIdForUpdate(paiementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement introuvable"));

        // ✅ sécurité (vérifie accès à l'inscription)
        inscriptionService.getInscriptionForCurrentUserOrAdmin(p.getInscription().getId());

        // ✅ idempotent : si déjà traité, on renvoie
        if (p.getStatut() == StatutPaiement.SUCCES || p.getStatut() == StatutPaiement.ECHEC) {
            return p;
        }

        Inscription ins = p.getInscription();

        // Si l'inscription est déjà PAYEE par ailleurs, on évite incohérences
        if (ins.getStatut() == StatutInscription.PAYEE) {
            p.setStatut(StatutPaiement.ECHEC);
            p.setReferenceExterne("ALREADY_PAID_" + UUID.randomUUID());
            p.setDatePaiement(LocalDateTime.now());
            return paiementRepository.save(p);
        }

        boolean ok = decideSuccess(dto);

        p.setModePaiement("CARTE_TEST");
        p.setDatePaiement(LocalDateTime.now());
        p.setReferenceExterne("PI_TEST_" + UUID.randomUUID());

        if (ok) {
            p.setStatut(StatutPaiement.SUCCES);

            // ✅ inscription devient PAYEE
            ins.setStatut(StatutInscription.PAYEE);

            // ✅ nettoyage : tous les autres EN_ATTENTE deviennent ECHEC
            nettoyerDoublonsEnAttente(ins.getId(), p.getId());
        } else {
            p.setStatut(StatutPaiement.ECHEC);
        }

        // p est déjà managed mais on save pour être clair
        return paiementRepository.save(p);
    }

    @Override
    public Paiement simulerPaiement(Long inscriptionId) {
        // simple : checkout + confirm auto
        Paiement co = creerCheckout(inscriptionId);

        PaiementConfirmRequestDto dto = new PaiementConfirmRequestDto();
        dto.setSimulate("auto");
        dto.setCardNumber("4242 4242 4242 4242");
        dto.setExpMonth(12);
        dto.setExpYear(LocalDateTime.now().getYear() + 2);
        dto.setCvc("123");

        return confirmerCheckout(co.getId(), dto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Paiement> paiementsParInscription(Long inscriptionId) {
        // sécurité
        inscriptionService.getInscriptionForCurrentUserOrAdmin(inscriptionId);
        return paiementRepository.findByInscription_Id(inscriptionId);
    }

    private void nettoyerDoublonsEnAttente(Long inscriptionId, Long keepPaiementId) {
        List<Paiement> pendings = paiementRepository.findByInscription_IdAndStatut(inscriptionId, StatutPaiement.EN_ATTENTE);
        for (Paiement other : pendings) {
            if (!other.getId().equals(keepPaiementId)) {
                other.setStatut(StatutPaiement.ECHEC);
                other.setReferenceExterne("CANCELLED_DUPLICATE_" + UUID.randomUUID());
                other.setDatePaiement(LocalDateTime.now());
                paiementRepository.save(other);
            }
        }
    }

    private boolean decideSuccess(PaiementConfirmRequestDto dto) {
        String sim = dto.getSimulate() == null ? "auto" : dto.getSimulate().trim().toLowerCase();

        if (sim.equals("success")) return true;
        if (sim.equals("fail")) return false;

        // auto : basé sur le numéro
        String digits = dto.getCardNumber() == null ? "" : dto.getCardNumber().replaceAll("\\D+", "");
        // Stripe-like test cards
        if ("4000000000000002".equals(digits)) return false; // échec
        if ("4242424242424242".equals(digits)) return true;  // succès

        // par défaut : succès (mode démo)
        return true;
    }
}

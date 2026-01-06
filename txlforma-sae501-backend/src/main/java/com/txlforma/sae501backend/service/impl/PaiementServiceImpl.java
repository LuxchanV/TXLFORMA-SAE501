package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.paiement.PaiementConfirmRequestDto;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.PaiementRepository;
import com.txlforma.sae501backend.service.PaiementService;
import com.txlforma.sae501backend.service.UtilisateurService;
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
public class PaiementServiceImpl implements PaiementService {

    private final PaiementRepository paiementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final UtilisateurService utilisateurService;

    @Override
    @Transactional
    public Paiement creerCheckout(Long inscriptionId) {
        Utilisateur me = utilisateurService.getCurrentUserEntity();

        // ✅ FULL FETCH (session + formation + utilisateur + intervenant...)
        Inscription ins = inscriptionRepository.findByIdFull(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        if (ins.getUtilisateur() == null || me.getId() == null || !me.getId().equals(ins.getUtilisateur().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }

        if (ins.getStatut() == StatutInscription.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inscription annulée : paiement impossible");
        }
        if (ins.getStatut() == StatutInscription.PAYEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inscription déjà payée");
        }

        Double montant = (ins.getSession() != null && ins.getSession().getFormation() != null)
                ? ins.getSession().getFormation().getPrix()
                : null;

        if (montant == null || montant <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prix formation invalide : paiement impossible");
        }

        // on force le statut en attente paiement
        ins.setStatut(StatutInscription.EN_ATTENTE_PAIEMENT);
        inscriptionRepository.save(ins);

        Paiement p = Paiement.builder()
                .inscription(ins)
                .montant(montant)
                .modePaiement("CARTE_TEST")
                .statut(StatutPaiement.EN_ATTENTE)
                .referenceExterne("sandbox_" + UUID.randomUUID())
                .datePaiement(LocalDateTime.now())
                .build();

        Paiement saved = paiementRepository.save(p);

        // ✅ recharge FULL FETCH pour éviter les soucis lazy côté controller
        return paiementRepository.findByIdFull(saved.getId()).orElse(saved);
    }

    @Override
    @Transactional
    public Paiement confirmerCheckout(Long paiementId, PaiementConfirmRequestDto dto) {
        Utilisateur me = utilisateurService.getCurrentUserEntity();

        // ✅ FULL FETCH (inscription + utilisateur + session + formation)
        Paiement p = paiementRepository.findByIdFull(paiementId)
                .orElseThrow(() -> new NotFoundException("Paiement introuvable"));

        Inscription ins = p.getInscription();
        if (ins == null || ins.getUtilisateur() == null || me.getId() == null || !me.getId().equals(ins.getUtilisateur().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }

        if (ins.getStatut() == StatutInscription.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inscription annulée : paiement impossible");
        }

        // si déjà payée, on sécurise
        if (ins.getStatut() == StatutInscription.PAYEE) {
            p.setStatut(StatutPaiement.SUCCES);
            p.setDatePaiement(LocalDateTime.now());
            return paiementRepository.save(p);
        }

        String simulate = (dto.getSimulate() == null) ? "auto" : dto.getSimulate().trim().toLowerCase();

        StatutPaiement next;
        if ("success".equals(simulate)) {
            next = StatutPaiement.SUCCES;
        } else if ("fail".equals(simulate)) {
            next = StatutPaiement.ECHEC;
        } else {
            String raw = (dto.getCardNumber() == null) ? "" : dto.getCardNumber();
            String card = raw.replaceAll("\\s+", "");

            if (card.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Numéro de carte requis");
            }

            if ("4242424242424242".equals(card)) next = StatutPaiement.SUCCES;       // ✅ success
            else if ("4000000000000002".equals(card)) next = StatutPaiement.ECHEC;  // ❌ fail
            else next = isValidLuhn(card) ? StatutPaiement.SUCCES : StatutPaiement.ECHEC;
        }

        p.setStatut(next);
        p.setModePaiement("CARTE_TEST");
        p.setDatePaiement(LocalDateTime.now());

        Paiement saved = paiementRepository.save(p);

        if (saved.getStatut() == StatutPaiement.SUCCES) {
            ins.setStatut(StatutInscription.PAYEE);
        } else {
            ins.setStatut(StatutInscription.EN_ATTENTE_PAIEMENT);
        }
        inscriptionRepository.save(ins);

        return paiementRepository.findByIdFull(saved.getId()).orElse(saved);
    }

    @Override
    @Transactional
    public Paiement simulerPaiement(Long inscriptionId) {
        Paiement p = creerCheckout(inscriptionId);

        PaiementConfirmRequestDto dto = new PaiementConfirmRequestDto();
        dto.setCardNumber("4242424242424242");
        dto.setExpMonth(12);
        dto.setExpYear(2030);
        dto.setCvc("123");
        dto.setSimulate("success");

        return confirmerCheckout(p.getId(), dto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Paiement> paiementsParInscription(Long inscriptionId) {
        Utilisateur me = utilisateurService.getCurrentUserEntity();

        // ✅ FULL FETCH pour vérifier ownership sans lazy
        Inscription ins = inscriptionRepository.findByIdFull(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        if (ins.getUtilisateur() == null || me.getId() == null || !me.getId().equals(ins.getUtilisateur().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }

        return paiementRepository.findByInscription_Id(inscriptionId);
    }

    private boolean isValidLuhn(String digits) {
        if (digits == null || digits.isBlank() || !digits.matches("\\d+")) return false;
        int sum = 0;
        boolean alt = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int n = digits.charAt(i) - '0';
            if (alt) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 == 0;
    }
}

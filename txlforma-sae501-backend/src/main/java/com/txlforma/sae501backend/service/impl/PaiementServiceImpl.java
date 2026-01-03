package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.PaiementRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    private final PaiementRepository paiementRepo;
    private final InscriptionRepository inscriptionRepo;
    private final UtilisateurRepository utilisateurRepo;

    @Override
    @Transactional
    public Paiement simulerPaiement(Long inscriptionId) {
        Utilisateur current = getCurrentUser();

        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        // ✅ Sécurité : owner ou admin
        ensureOwnerOrAdmin(current, ins);

        if (ins.getStatut() == StatutInscription.PAYEE) {
            throw new ConflictException("Inscription déjà payée");
        }
        if (ins.getStatut() == StatutInscription.ANNULEE) {
            throw new ConflictException("Inscription annulée : paiement impossible");
        }

        double montant = (ins.getSession().getFormation().getPrix() == null)
                ? 0.0
                : ins.getSession().getFormation().getPrix();

        Paiement p = Paiement.builder()
                .inscription(ins)
                .montant(montant)
                .modePaiement("SIMULATION")
                .statut(StatutPaiement.SUCCES)
                .build();

        Paiement saved = paiementRepo.save(p);

        ins.setStatut(StatutInscription.PAYEE);
        inscriptionRepo.save(ins);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Paiement> paiementsParInscription(Long inscriptionId) {
        Utilisateur current = getCurrentUser();

        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        // ✅ Sécurité : owner ou admin
        ensureOwnerOrAdmin(current, ins);

        return paiementRepo.findByInscription_Id(inscriptionId);
    }

    // -------------------------
    // Helpers
    // -------------------------
    private void ensureOwnerOrAdmin(Utilisateur current, Inscription ins) {
        boolean isAdmin = current.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = ins.getUtilisateur() != null
                && ins.getUtilisateur().getId().equals(current.getId());

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Accès refusé");
        }
    }

    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ForbiddenException("Non authentifié");
        }
        String email = auth.getName();
        return utilisateurRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur courant introuvable"));
    }
}

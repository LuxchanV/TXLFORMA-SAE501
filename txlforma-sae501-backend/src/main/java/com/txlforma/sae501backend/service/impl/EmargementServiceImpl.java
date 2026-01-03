package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Emargement;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.EmargementRepository;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.EmargementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmargementServiceImpl implements EmargementService {

    private final EmargementRepository emargementRepo;
    private final InscriptionRepository inscriptionRepo;
    private final UtilisateurRepository utilisateurRepo;

    @Override
    public Emargement marquerPresence(Long inscriptionId, LocalDate dateJour, boolean present) {
        Utilisateur current = getCurrentUser();

        // ✅ seulement ADMIN / FORMATEUR
        requireFormateurOrAdmin(current);

        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        // ✅ si FORMATEUR => doit être le formateur de la session
        ensureFormateurDeLaSessionOrAdmin(current, ins.getSession());

        emargementRepo.findByInscription_IdAndDateJour(inscriptionId, dateJour)
                .ifPresent(e -> { throw new ConflictException("Présence déjà renseignée pour ce jour"); });

        Emargement e = Emargement.builder()
                .inscription(ins)
                .dateJour(dateJour)
                .present(present)
                .build();

        return emargementRepo.save(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Emargement> emargementsParInscription(Long inscriptionId) {
        Utilisateur current = getCurrentUser();

        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        // ✅ lecture : admin OU owner OU formateur de la session
        ensureOwnerOrAdminOrFormateurDeLaSession(current, ins);

        return emargementRepo.findByInscription_Id(inscriptionId);
    }

    // -------------------------
    // Helpers sécurité
    // -------------------------
    private void requireFormateurOrAdmin(Utilisateur current) {
        if (current.getRole() != Role.ROLE_ADMIN && current.getRole() != Role.ROLE_FORMATEUR) {
            throw new ForbiddenException("Accès refusé");
        }
    }

    private void ensureFormateurDeLaSessionOrAdmin(Utilisateur current, SessionFormation session) {
        if (current.getRole() == Role.ROLE_ADMIN) return;

        if (session == null || session.getIntervenant() == null || session.getIntervenant().getUtilisateur() == null) {
            throw new ForbiddenException("Aucun intervenant assigné à cette session");
        }

        Long formateurUserId = session.getIntervenant().getUtilisateur().getId();
        if (!formateurUserId.equals(current.getId())) {
            throw new ForbiddenException("Vous n'êtes pas l'intervenant de cette session");
        }
    }

    private void ensureOwnerOrAdminOrFormateurDeLaSession(Utilisateur current, Inscription ins) {
        boolean isAdmin = current.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = ins.getUtilisateur() != null && ins.getUtilisateur().getId().equals(current.getId());

        if (isAdmin || isOwner) return;

        // sinon : formateur de la session
        ensureFormateurDeLaSessionOrAdmin(current, ins.getSession());
    }

    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ForbiddenException("Non authentifié");
        }
        return utilisateurRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Utilisateur courant introuvable"));
    }
}

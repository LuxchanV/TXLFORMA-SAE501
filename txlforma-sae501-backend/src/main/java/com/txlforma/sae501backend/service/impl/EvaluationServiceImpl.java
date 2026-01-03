package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Evaluation;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.EvaluationRepository;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepo;
    private final InscriptionRepository inscriptionRepo;
    private final UtilisateurRepository utilisateurRepo;

    @Override
    public Evaluation enregistrerEvaluation(Long inscriptionId, double note, String commentaire) {
        Utilisateur current = getCurrentUser();

        // ✅ seulement ADMIN / FORMATEUR
        requireFormateurOrAdmin(current);

        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        // ✅ si FORMATEUR => doit être le formateur de la session
        ensureFormateurDeLaSessionOrAdmin(current, ins.getSession());

        if (evaluationRepo.findByInscription_Id(inscriptionId).isPresent()) {
            throw new ConflictException("Évaluation déjà existante pour cette inscription");
        }

        Evaluation e = Evaluation.builder()
                .inscription(ins)
                .note(note)
                .commentaire(commentaire)
                .build();

        return evaluationRepo.save(e);
    }

    @Override
    @Transactional(readOnly = true)
    public Evaluation getEvaluation(Long inscriptionId) {
        Utilisateur current = getCurrentUser();

        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        // ✅ lecture : admin OU owner OU formateur de la session
        ensureOwnerOrAdminOrFormateurDeLaSession(current, ins);

        return evaluationRepo.findByInscription_Id(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Évaluation introuvable"));
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

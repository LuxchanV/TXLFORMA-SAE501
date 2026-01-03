package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutSession;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.InscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InscriptionServiceImpl implements InscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final SessionFormationRepository sessionFormationRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public Inscription creerInscription(Long sessionId) {
        Utilisateur user = getCurrentUser();

        SessionFormation session = sessionFormationRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session introuvable"));

        // ✅ Session doit être OUVERTE
        if (session.getStatut() != null && session.getStatut() != StatutSession.OUVERTE) {
            throw new ConflictException("Session non ouverte : inscription impossible");
        }

        // ✅ Déjà inscrit ?
        if (inscriptionRepository.existsByUtilisateur_IdAndSession_Id(user.getId(), sessionId)) {
            throw new ConflictException("Vous êtes déjà inscrit à cette session");
        }

        // ✅ Places restantes (compte EN_ATTENTE + PAYEE)
        long nbPris = inscriptionRepository.countBySession_IdAndStatutIn(
                sessionId,
                List.of(StatutInscription.EN_ATTENTE_PAIEMENT, StatutInscription.PAYEE)
        );

        Integer max = session.getNbPlacesMax(); // si null => pas de limite
        if (max != null && nbPris >= max) {
            throw new ConflictException("Session complète : plus de places disponibles");
        }

        // ✅ Création
        Inscription insc = new Inscription();
        insc.setUtilisateur(user);
        insc.setSession(session);
        insc.setStatut(StatutInscription.EN_ATTENTE_PAIEMENT);

        return inscriptionRepository.save(insc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> mesInscriptions() {
        Utilisateur user = getCurrentUser();
        return inscriptionRepository.findAllByUtilisateurIdWithSession(user.getId());
    }

    @Override
    public void annulerInscription(Long inscriptionId) {
        Utilisateur user = getCurrentUser();

        Inscription insc = inscriptionRepository.findByIdWithUtilisateur(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = insc.getUtilisateur() != null && insc.getUtilisateur().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Accès refusé");
        }

        // ✅ règle : un user ne peut pas annuler si déjà PAYEE (admin peut)
        if (!isAdmin && insc.getStatut() == StatutInscription.PAYEE) {
            throw new ConflictException("Inscription déjà payée : annulation impossible");
        }

        // idempotent
        if (insc.getStatut() == StatutInscription.ANNULEE) return;

        insc.setStatut(StatutInscription.ANNULEE);
        inscriptionRepository.save(insc);
    }

    @Override
    @Transactional(readOnly = true)
    public Inscription getInscriptionForCurrentUserOrAdmin(Long inscriptionId) {
        Utilisateur user = getCurrentUser();

        Inscription insc = inscriptionRepository.findByIdWithUtilisateur(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = insc.getUtilisateur() != null && insc.getUtilisateur().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Accès refusé");
        }

        return insc;
    }

    // -------------------------
    // Helpers
    // -------------------------
    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ForbiddenException("Non authentifié");
        }

        String email = auth.getName();

        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur courant introuvable"));
    }
}

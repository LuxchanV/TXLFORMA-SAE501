package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.admin.*;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Intervenant;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.IntervenantRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.AdminUtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUtilisateurServiceImpl implements AdminUtilisateurService {

    private final UtilisateurRepository utilisateurRepo;
    private final IntervenantRepository intervenantRepo;
    private final SessionFormationRepository sessionRepo;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> lister(String q, Role role, Boolean actif) {
        return utilisateurRepo.searchAdmin(q, role, actif)
                .stream()
                .map(AdminUserResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponseDto get(Long id) {
        Utilisateur u = utilisateurRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto update(Long id, AdminUserUpdateDto dto) {
        Utilisateur u = utilisateurRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        // email unique si changement
        if (!u.getEmail().equalsIgnoreCase(dto.getEmail()) && utilisateurRepo.existsByEmail(dto.getEmail())) {
            throw new ConflictException("Email déjà utilisé");
        }

        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        u.setTelephone(dto.getTelephone());
        u.setAdressePostale(dto.getAdressePostale());
        u.setEntreprise(dto.getEntreprise());

        return AdminUserResponseDto.fromEntity(utilisateurRepo.save(u));
    }

    @Override
    public AdminUserResponseDto changerRole(Long id, Role role) {
        Utilisateur u = utilisateurRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        Role old = u.getRole();

        // Si on passe en FORMATEUR -> créer Intervenant si absent
        if (role == Role.ROLE_FORMATEUR) {
            if (old == Role.ROLE_ADMIN) {
                throw new ConflictException("Un admin ne peut pas être formateur");
            }
            if (!intervenantRepo.existsByUtilisateur_Id(u.getId())) {
                Intervenant itv = Intervenant.builder()
                        .utilisateur(u)
                        .specialite(null)
                        .statut(null)
                        .tauxHoraire(null)
                        .build();
                intervenantRepo.save(itv);
            }
        }

        // Si on quitte FORMATEUR -> vérifier pas assigné à une session puis supprimer intervenant
        if (old == Role.ROLE_FORMATEUR && role != Role.ROLE_FORMATEUR) {
            var itvOpt = intervenantRepo.findByUtilisateur_Id(u.getId());
            if (itvOpt.isPresent()) {
                Long itvId = itvOpt.get().getId();
                if (sessionRepo.existsByIntervenant_Id(itvId)) {
                    throw new ConflictException("Impossible : ce formateur est assigné à une session");
                }
                intervenantRepo.deleteById(itvId);
            }
        }

        u.setRole(role);
        return AdminUserResponseDto.fromEntity(utilisateurRepo.save(u));
    }

    @Override
    public AdminUserResponseDto changerActif(Long id, Boolean actif) {
        Utilisateur u = utilisateurRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        u.setActif(actif);
        return AdminUserResponseDto.fromEntity(utilisateurRepo.save(u));
    }

    @Override
    public void supprimer(Long id) {
        if (!utilisateurRepo.existsById(id)) throw new NotFoundException("Utilisateur introuvable");
        // Simple : on désactive au lieu de delete hard (plus safe)
        Utilisateur u = utilisateurRepo.findById(id).orElseThrow();
        u.setActif(false);
        utilisateurRepo.save(u);
    }
}

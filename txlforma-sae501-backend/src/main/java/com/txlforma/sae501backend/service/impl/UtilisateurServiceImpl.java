package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.auth.RegisterRequestDto;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Utilisateur register(RegisterRequestDto dto) {
        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictException("Email déjà utilisé");
        }

        Utilisateur u = Utilisateur.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .telephone(dto.getTelephone())
                .adressePostale(dto.getAdressePostale())
                .entreprise(dto.getEntreprise())
                .role(Role.ROLE_USER)
                .build();

        return utilisateurRepository.save(u);
    }

    @Override
    public Utilisateur getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur courant introuvable"));
    }

    @Override
    public void changeMyPassword(String oldPassword, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Nouveau mot de passe invalide");
        }
        if (oldPassword == null || oldPassword.isBlank()) {
            throw new IllegalArgumentException("Ancien mot de passe invalide");
        }

        Utilisateur u = getCurrentUserEntity();

        // check ancien mdp
        if (!passwordEncoder.matches(oldPassword, u.getMotDePasse())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect");
        }

        // update
        u.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(u);
    }
}

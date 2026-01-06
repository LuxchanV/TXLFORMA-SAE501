package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.admin.*;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.AdminUtilisateurService;
import com.txlforma.sae501backend.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUtilisateurServiceImpl implements AdminUtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> lister(String q, Role role, Boolean actif) {
        return utilisateurRepository.searchAdmin(q, role, actif)
                .stream()
                .map(AdminUserResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponseDto get(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto update(Long id, AdminUserUpdateDto dto) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        String newEmail = dto.email() == null ? "" : dto.email().trim().toLowerCase();
        if (newEmail.isBlank()) throw new IllegalArgumentException("Email invalide");

        if (!Objects.equals(u.getEmail(), newEmail) && utilisateurRepository.existsByEmail(newEmail)) {
            throw new ConflictException("Email déjà utilisé");
        }

        u.setNom(dto.nom().trim());
        u.setPrenom(dto.prenom().trim());
        u.setEmail(newEmail);

        u.setTelephone(dto.telephone());
        u.setAdressePostale(dto.adressePostale());
        u.setEntreprise(dto.entreprise());

        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto changerRole(Long id, Role role) {
        if (role == null) throw new IllegalArgumentException("Role invalide");

        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        u.setRole(role);
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto changerActif(Long id, Boolean actif) {
        if (actif == null) throw new IllegalArgumentException("actif invalide");

        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        u.setActif(actif);
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public void supprimer(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        utilisateurRepository.delete(u);
    }

    @Override
    public AdminCreateUserResponseDto creer(AdminCreateUserRequestDto dto) {
        String email = dto.email() == null ? "" : dto.email().trim().toLowerCase();
        if (email.isBlank()) throw new IllegalArgumentException("Email invalide");
        if (dto.role() == null) throw new IllegalArgumentException("Role invalide");

        if (utilisateurRepository.existsByEmail(email)) {
            throw new ConflictException("Email déjà utilisé");
        }

        String temp = dto.temporaryPassword();
        if (temp == null || temp.isBlank()) temp = PasswordGenerator.generate(14);

        Boolean actif = dto.actif() == null ? true : dto.actif();

        Utilisateur u = Utilisateur.builder()
                .nom(dto.nom().trim())
                .prenom(dto.prenom().trim())
                .email(email)
                .motDePasse(passwordEncoder.encode(temp))
                .role(dto.role())
                .actif(actif)
                .mustChangePassword(true)
                .build();

        Utilisateur saved = utilisateurRepository.save(u);

        return new AdminCreateUserResponseDto(
                saved.getId(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getRole(),
                saved.getActif(),
                true,
                saved.getDateCreation(),
                temp
        );
    }
}

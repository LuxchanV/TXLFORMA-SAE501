package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.admin.AdminUserResponseDto;
import com.txlforma.sae501backend.dto.admin.AdminUserUpdateDto;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.AdminUtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUtilisateurServiceImpl implements AdminUtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto update(Long id, AdminUserUpdateDto dto) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        String newEmail = dto.getEmail() == null ? null : dto.getEmail().trim();
        if (newEmail == null || newEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalide");
        }

        if (!Objects.equals(u.getEmail(), newEmail) && utilisateurRepository.existsByEmail(newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé");
        }

        u.setNom(dto.getNom().trim());
        u.setPrenom(dto.getPrenom().trim());
        u.setEmail(newEmail);

        u.setTelephone(dto.getTelephone());
        u.setAdressePostale(dto.getAdressePostale());
        u.setEntreprise(dto.getEntreprise());

        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto changerRole(Long id, Role role) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role invalide");
        }

        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        u.setRole(role);
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public AdminUserResponseDto changerActif(Long id, Boolean actif) {
        if (actif == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "actif invalide");
        }

        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        u.setActif(actif);
        return AdminUserResponseDto.fromEntity(u);
    }

    @Override
    public void supprimer(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        utilisateurRepository.delete(u);
    }
}

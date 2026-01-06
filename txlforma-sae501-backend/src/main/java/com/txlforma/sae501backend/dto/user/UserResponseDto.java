package com.txlforma.sae501backend.dto.user;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long id,
        String nom,
        String prenom,
        String email,
        Role role,
        Boolean actif,
        Boolean mustChangePassword,
        LocalDateTime dateCreation
) {
    public static UserResponseDto fromEntity(Utilisateur u) {
        return new UserResponseDto(
                u.getId(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getRole(),
                u.getActif(),
                u.getMustChangePassword(),
                u.getDateCreation()
        );
    }
}

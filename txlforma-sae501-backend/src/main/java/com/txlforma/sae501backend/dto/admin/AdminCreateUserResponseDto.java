package com.txlforma.sae501backend.dto.admin;

import com.txlforma.sae501backend.model.enums.Role;

import java.time.LocalDateTime;

public record AdminCreateUserResponseDto(
        Long id,
        String nom,
        String prenom,
        String email,
        Role role,
        Boolean actif,
        boolean mustChangePassword,
        LocalDateTime dateCreation,
        String temporaryPassword // renvoyé UNE FOIS à l’admin
) {}

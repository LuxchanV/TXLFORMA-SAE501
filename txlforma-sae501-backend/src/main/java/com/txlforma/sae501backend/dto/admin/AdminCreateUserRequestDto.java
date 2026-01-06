package com.txlforma.sae501backend.dto.admin;

import com.txlforma.sae501backend.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminCreateUserRequestDto(
        @NotBlank String nom,
        @NotBlank String prenom,
        @Email @NotBlank String email,
        @NotNull Role role,
        Boolean actif,
        String temporaryPassword // optionnel : si null -> généré automatiquement
) {}

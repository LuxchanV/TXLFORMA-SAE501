package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminUserUpdateDto(
        @NotBlank String nom,
        @NotBlank String prenom,
        @Email @NotBlank String email,
        String telephone,
        String adressePostale,
        String entreprise
) {}

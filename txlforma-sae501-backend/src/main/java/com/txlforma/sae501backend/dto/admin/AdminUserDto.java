package com.txlforma.sae501backend.dto.admin;

public record AdminUserDto(
        Long id,
        String nom,
        String prenom,
        String email,
        String telephone,
        String adressePostale,
        String entreprise,
        String role
) {}

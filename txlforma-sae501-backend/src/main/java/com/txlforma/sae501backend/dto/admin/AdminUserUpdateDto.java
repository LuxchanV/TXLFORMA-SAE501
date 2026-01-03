package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminUserUpdateDto {
    @NotBlank private String nom;
    @NotBlank private String prenom;
    @Email @NotBlank private String email;

    private String telephone;
    private String adressePostale;
    private String entreprise;
}

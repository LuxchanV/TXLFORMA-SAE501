package com.txlforma.sae501backend.dto.admin;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponseDto {

    private Long id;
    private String nom;
    private String prenom;
    private String email;

    private String telephone;
    private String adressePostale;
    private String entreprise;

    private Role role;
    private Boolean actif;
    private LocalDateTime dateCreation;

    public static AdminUserResponseDto fromEntity(Utilisateur u) {
        return AdminUserResponseDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .telephone(u.getTelephone())
                .adressePostale(u.getAdressePostale())
                .entreprise(u.getEntreprise())
                .role(u.getRole())
                .actif(u.getActif())
                .dateCreation(u.getDateCreation())
                .build();
    }
}

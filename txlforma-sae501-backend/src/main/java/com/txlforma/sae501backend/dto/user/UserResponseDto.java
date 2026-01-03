package com.txlforma.sae501backend.dto.user;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adressePostale;
    private String entreprise;
    private Role role;

    public static UserResponseDto fromEntity(Utilisateur u) {
        return UserResponseDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .telephone(u.getTelephone())
                .adressePostale(u.getAdressePostale())
                .entreprise(u.getEntreprise())
                .role(u.getRole())
                .build();
    }
}

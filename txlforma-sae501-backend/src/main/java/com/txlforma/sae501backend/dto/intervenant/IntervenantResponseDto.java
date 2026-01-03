package com.txlforma.sae501backend.dto.intervenant;

import com.txlforma.sae501backend.model.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IntervenantResponseDto {
    private Long id;

    private Long utilisateurId;
    private String nom;
    private String prenom;
    private String email;
    private Role role;

    private String specialite;
    private String statut;
    private Double tauxHoraire;
}

package com.txlforma.sae501backend.dto.intervenant;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminIntervenantUpsertDto {

    // obligatoire à la création
    @NotNull
    private Long utilisateurId;

    private String specialite;
    private String statut;     // FREELANCE / CDD / VACATAIRE
    private Double tauxHoraire;
}

package com.txlforma.sae501backend.dto.intervenant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IntervenantCreateDto {
    private String specialite;
    private String statut;     // FREELANCE / CDD / VACATAIRE
    private Double tauxHoraire;
}

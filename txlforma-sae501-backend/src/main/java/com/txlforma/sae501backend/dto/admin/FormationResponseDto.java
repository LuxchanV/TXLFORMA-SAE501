package com.txlforma.sae501backend.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FormationResponseDto {
    private Long id;

    private String titre;
    private String description;
    private Integer dureeHeures;
    private Double prix;
    private String niveau;

    private Long categorieId;
    private String categorieNom;
}

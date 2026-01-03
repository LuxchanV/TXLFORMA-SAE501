package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class FormationUpsertDto {

    @NotBlank
    private String titre;

    private String description;

    private Integer dureeHeures;
    private Double prix;
    private String niveau;

    @NotNull
    private Long categorieId;
}

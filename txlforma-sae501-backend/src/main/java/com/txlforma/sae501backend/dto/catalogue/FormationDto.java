package com.txlforma.sae501backend.dto.catalogue;

import com.txlforma.sae501backend.model.entity.Formation;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FormationDto {
    private Long id;
    private String titre;
    private String description;
    private Integer dureeHeures;
    private Double prix;
    private String niveau;
    private Long categorieId;

    public static FormationDto fromEntity(Formation f) {
        return FormationDto.builder()
                .id(f.getId())
                .titre(f.getTitre())
                .description(f.getDescription())
                .dureeHeures(f.getDureeHeures())
                .prix(f.getPrix())
                .niveau(f.getNiveau())
                .categorieId(f.getCategorie().getId())
                .build();
    }
}

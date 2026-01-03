package com.txlforma.sae501backend.dto.catalogue;

import com.txlforma.sae501backend.model.entity.CategorieFormation;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategorieDto {
    private Long id;
    private String nom;
    private String description;

    public static CategorieDto fromEntity(CategorieFormation c) {
        return CategorieDto.builder()
                .id(c.getId())
                .nom(c.getNom())
                .description(c.getDescription())
                .build();
    }
}

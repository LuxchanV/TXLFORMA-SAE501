package com.txlforma.sae501backend.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategorieResponseDto {
    private Long id;
    private String nom;
    private String description;
}

package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CategorieUpsertDto {

    @NotBlank
    private String nom;

    private String description;
}

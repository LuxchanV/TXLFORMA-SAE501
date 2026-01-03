package com.txlforma.sae501backend.dto.intervenant;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EvaluationRequestDto {

    @NotNull
    private Long inscriptionId;

    @NotNull
    @Min(0)
    @Max(20)
    private Integer note;

    private String commentaire;
}

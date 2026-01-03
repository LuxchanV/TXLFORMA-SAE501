package com.txlforma.sae501backend.dto.evaluation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvaluationCreateDto {
    @NotNull private Long inscriptionId;
    @NotNull @Min(0) @Max(20) private Double note;
    private String commentaire;
}

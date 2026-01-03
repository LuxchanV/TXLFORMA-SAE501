package com.txlforma.sae501backend.dto.emargement;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmargementMarquerDto {
    @NotNull private Long inscriptionId;
    @NotNull private LocalDate dateJour;
    @NotNull private Boolean present;
}

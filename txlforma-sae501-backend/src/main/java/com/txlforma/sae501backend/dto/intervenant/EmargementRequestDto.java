package com.txlforma.sae501backend.dto.intervenant;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class EmargementRequestDto {

    @NotNull
    private Long inscriptionId;

    @NotNull
    private LocalDate dateJour;

    @NotNull
    private Boolean present;
}

package com.txlforma.sae501backend.dto.intervenant;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class HeuresSetRequestDto {

    @NotNull
    private Long sessionId;

    @NotNull
    private LocalDate dateJour;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double heures;
}

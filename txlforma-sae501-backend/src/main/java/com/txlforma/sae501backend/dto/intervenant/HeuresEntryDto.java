package com.txlforma.sae501backend.dto.intervenant;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HeuresEntryDto {
    private LocalDate dateJour;
    private Double heures;
}

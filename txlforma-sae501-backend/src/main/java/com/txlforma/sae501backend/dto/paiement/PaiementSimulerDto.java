package com.txlforma.sae501backend.dto.paiement;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaiementSimulerDto {
    @NotNull private Long inscriptionId;
}

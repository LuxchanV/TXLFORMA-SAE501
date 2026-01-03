package com.txlforma.sae501backend.dto.inscription;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InscriptionCreateDto {
    @NotNull
    private Long sessionId;
}

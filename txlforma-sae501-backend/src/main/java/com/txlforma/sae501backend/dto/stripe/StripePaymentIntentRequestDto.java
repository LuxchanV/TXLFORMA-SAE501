package com.txlforma.sae501backend.dto.stripe;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StripePaymentIntentRequestDto {
    @NotNull
    private Long inscriptionId;
}

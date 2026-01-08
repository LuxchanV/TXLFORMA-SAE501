package com.txlforma.sae501backend.dto.stripe;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StripeConfirmRequestDto {
    @NotBlank
    private String paymentIntentId;
}

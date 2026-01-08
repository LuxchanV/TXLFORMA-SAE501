package com.txlforma.sae501backend.dto.stripe;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StripePaymentIntentResponseDto {
    private Long paiementId;
    private Long inscriptionId;

    private String paymentIntentId;
    private String clientSecret;

    private Double montant;
    private String formationTitre;
    private String currency;
}

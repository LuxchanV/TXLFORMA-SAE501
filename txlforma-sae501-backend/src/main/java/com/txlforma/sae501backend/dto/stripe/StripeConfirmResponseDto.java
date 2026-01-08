package com.txlforma.sae501backend.dto.stripe;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StripeConfirmResponseDto {
    private Long paiementId;
    private Long inscriptionId;

    private String paymentIntentStatus; // ex: "succeeded"
    private String paiementStatut;      // ex: "SUCCES"
    private String inscriptionStatut;   // ex: "PAYEE"
}

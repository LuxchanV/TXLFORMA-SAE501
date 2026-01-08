package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.stripe.StripeConfirmResponseDto;
import com.txlforma.sae501backend.dto.stripe.StripePaymentIntentResponseDto;

public interface StripeService {
    StripePaymentIntentResponseDto createPaymentIntentForInscription(Long inscriptionId);

    // ✅ Webhook
    void handleWebhook(String payload, String signatureHeader);

    // ✅ Sync immédiat après confirmCardPayment (utile même sans webhook)
    StripeConfirmResponseDto confirmPaymentIntent(String paymentIntentId);
}

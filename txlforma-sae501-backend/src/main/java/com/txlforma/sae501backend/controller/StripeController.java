package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.stripe.StripeConfirmRequestDto;
import com.txlforma.sae501backend.dto.stripe.StripeConfirmResponseDto;
import com.txlforma.sae501backend.dto.stripe.StripePaymentIntentRequestDto;
import com.txlforma.sae501backend.dto.stripe.StripePaymentIntentResponseDto;
import com.txlforma.sae501backend.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final StripeService stripeService;

    @PostMapping("/payment-intent")
    public StripePaymentIntentResponseDto createPaymentIntent(@Valid @RequestBody StripePaymentIntentRequestDto dto) {
        return stripeService.createPaymentIntentForInscription(dto.getInscriptionId());
    }

    // ✅ Sync immédiat après paiement (front)
    @PostMapping("/confirm")
    public StripeConfirmResponseDto confirm(@Valid @RequestBody StripeConfirmRequestDto dto) {
        return stripeService.confirmPaymentIntent(dto.getPaymentIntentId());
    }

    // ✅ Webhook Stripe (pas de JWT)
    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> webhook(@RequestBody String payload,
                                        @RequestHeader("Stripe-Signature") String sig) {
        stripeService.handleWebhook(payload, sig);
        return ResponseEntity.ok().build();
    }
}

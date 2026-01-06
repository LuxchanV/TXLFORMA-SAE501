package com.txlforma.sae501backend.dto.paiement;

import lombok.Data;

@Data
public class PaiementConfirmRequestDto {

    // "auto" (déduit via numéro), "success", "fail"
    private String simulate;

    private String cardNumber; // ex: 4242 4242 4242 4242
    private Integer expMonth;  // ex: 12
    private Integer expYear;   // ex: 2030
    private String cvc;        // ex: 123
}

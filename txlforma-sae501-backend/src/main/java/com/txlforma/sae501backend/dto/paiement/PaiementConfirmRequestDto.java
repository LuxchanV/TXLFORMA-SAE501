package com.txlforma.sae501backend.dto.paiement;

import lombok.Data;

@Data
public class PaiementConfirmRequestDto {
    private String simulate;  // auto | success | fail
    private String cardNumber;
    private Integer expMonth;
    private Integer expYear;
    private String cvc;
}

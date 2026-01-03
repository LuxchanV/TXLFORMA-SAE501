package com.txlforma.sae501backend.dto.paiement;

import com.txlforma.sae501backend.model.enums.StatutPaiement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaiementCreateDto {

    @NotNull
    private Long inscriptionId;

    @NotNull
    @Positive
    private Double montant;

    // optionnel
    private String modePaiement;      // ex: "CB", "VIREMENT", "ADMIN"
    private StatutPaiement statut;    // EN_ATTENTE / SUCCES / ECHEC
    private String referenceExterne;  // optionnel
}

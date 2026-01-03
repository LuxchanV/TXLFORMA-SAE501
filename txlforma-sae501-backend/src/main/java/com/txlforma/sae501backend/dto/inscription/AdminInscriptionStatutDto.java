package com.txlforma.sae501backend.dto.inscription;

import com.txlforma.sae501backend.model.enums.StatutInscription;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminInscriptionStatutDto {

    @NotNull
    private StatutInscription statut; // EN_ATTENTE_PAIEMENT / PAYEE / ANNULEE
}

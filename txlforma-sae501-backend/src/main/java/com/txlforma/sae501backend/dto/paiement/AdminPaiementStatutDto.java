package com.txlforma.sae501backend.dto.paiement;

import com.txlforma.sae501backend.model.enums.StatutPaiement;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaiementStatutDto {

    @NotNull
    private StatutPaiement statut; // EN_ATTENTE / SUCCES / ECHEC
}

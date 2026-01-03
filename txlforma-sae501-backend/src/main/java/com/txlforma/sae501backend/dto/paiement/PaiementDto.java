package com.txlforma.sae501backend.dto.paiement;

import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaiementDto {
    private Long id;
    private Long inscriptionId;
    private Double montant;
    private LocalDateTime datePaiement;
    private String modePaiement;
    private StatutPaiement statut;

    public static PaiementDto fromEntity(Paiement p) {
        return PaiementDto.builder()
                .id(p.getId())
                .inscriptionId(p.getInscription().getId())
                .montant(p.getMontant())
                .datePaiement(p.getDatePaiement())
                .modePaiement(p.getModePaiement())
                .statut(p.getStatut())
                .build();
    }
}

package com.txlforma.sae501backend.dto.paiement;

import com.txlforma.sae501backend.model.entity.Paiement;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaiementCheckoutResponseDto {

    private Long paiementId;
    private Long inscriptionId;
    private Double montant;
    private String formationTitre;

    public static PaiementCheckoutResponseDto fromEntity(Paiement p) {
        String titre = null;
        Long inscriptionId = null;

        if (p.getInscription() != null) {
            inscriptionId = p.getInscription().getId();
            if (p.getInscription().getSession() != null
                    && p.getInscription().getSession().getFormation() != null) {
                titre = p.getInscription().getSession().getFormation().getTitre();
            }
        }

        return PaiementCheckoutResponseDto.builder()
                .paiementId(p.getId())
                .inscriptionId(inscriptionId)
                .montant(p.getMontant())
                .formationTitre(titre)
                .build();
    }
}

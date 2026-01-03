package com.txlforma.sae501backend.dto.intervenant;

import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class IntervenantParticipantDto {

    private Long inscriptionId;

    private Long utilisateurId;
    private String prenom;
    private String nom;
    private String email;

    private StatutInscription statut;
    private boolean payee;

    public static IntervenantParticipantDto fromEntity(Inscription i) {
        Utilisateur u = i.getUtilisateur();
        StatutInscription st = i.getStatut();

        // robuste selon ton enum (PAYEE / PAYE / PAID...)
        boolean isPayee = false;
        if (st != null) {
            String name = st.name().toUpperCase();
            isPayee = name.equals("PAYEE") || name.equals("PAYE") || name.equals("PAID");
        }

        return IntervenantParticipantDto.builder()
                .inscriptionId(i.getId())
                .utilisateurId(u != null ? u.getId() : null)
                .prenom(u != null ? u.getPrenom() : null)
                .nom(u != null ? u.getNom() : null)
                .email(u != null ? u.getEmail() : null)
                .statut(st)
                .payee(isPayee)
                .build();
    }
}

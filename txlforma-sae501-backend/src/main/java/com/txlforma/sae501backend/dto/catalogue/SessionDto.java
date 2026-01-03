package com.txlforma.sae501backend.dto.catalogue;

import com.txlforma.sae501backend.model.entity.Intervenant;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.StatutSession;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SessionDto {
    private Long id;

    private Long formationId;
    private String formationTitre; // ✅ NOUVEAU (utile admin + UI)

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String salle;
    private Integer nbPlacesMax;
    private StatutSession statut;

    private Long intervenantId;
    private String intervenantNom;     // ✅ NOUVEAU
    private String intervenantPrenom;  // ✅ NOUVEAU
    private String intervenantEmail;   // ✅ NOUVEAU

    public static SessionDto fromEntity(SessionFormation s) {
        var f = s.getFormation();

        Intervenant itv = s.getIntervenant();
        Utilisateur itvUser = (itv != null) ? itv.getUtilisateur() : null;

        return SessionDto.builder()
                .id(s.getId())
                .formationId(f != null ? f.getId() : null)
                .formationTitre(f != null ? f.getTitre() : null)

                .dateDebut(s.getDateDebut())
                .dateFin(s.getDateFin())
                .salle(s.getSalle())
                .nbPlacesMax(s.getNbPlacesMax())
                .statut(s.getStatut())

                .intervenantId(itv != null ? itv.getId() : null)
                .intervenantNom(itvUser != null ? itvUser.getNom() : null)
                .intervenantPrenom(itvUser != null ? itvUser.getPrenom() : null)
                .intervenantEmail(itvUser != null ? itvUser.getEmail() : null)
                .build();
    }
}

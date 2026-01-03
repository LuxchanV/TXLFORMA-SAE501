package com.txlforma.sae501backend.dto.intervenant;

import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.enums.StatutSession;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class IntervenantSessionDto {

    private Long id;

    private Long formationId;
    private String formationTitre;
    private Integer formationDureeHeures;

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String salle;
    private Integer nbPlacesMax;
    private StatutSession statut;

    public static IntervenantSessionDto fromEntity(SessionFormation s) {
        return IntervenantSessionDto.builder()
                .id(s.getId())
                .formationId(s.getFormation() != null ? s.getFormation().getId() : null)
                .formationTitre(s.getFormation() != null ? s.getFormation().getTitre() : null)
                .formationDureeHeures(s.getFormation() != null ? s.getFormation().getDureeHeures() : null)
                .dateDebut(s.getDateDebut())
                .dateFin(s.getDateFin())
                .salle(s.getSalle())
                .nbPlacesMax(s.getNbPlacesMax())
                .statut(s.getStatut())
                .build();
    }
}

package com.txlforma.sae501backend.dto.session;

import com.txlforma.sae501backend.model.enums.StatutSession;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminSessionUpdateDto {

    private Long formationId;
    private Long intervenantId;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    private String salle;
    private Integer nbPlacesMax;
    private StatutSession statut;
}

package com.txlforma.sae501backend.dto.session;

import com.txlforma.sae501backend.model.enums.StatutSession;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminSessionCreateDto {

    @NotNull(message = "formationId est requis")
    private Long formationId;

    private Long intervenantId;

    @NotNull(message = "dateDebut est requise")
    private LocalDate dateDebut;

    @NotNull(message = "dateFin est requise")
    private LocalDate dateFin;

    private String salle;
    private Integer nbPlacesMax;
    private StatutSession statut;
}

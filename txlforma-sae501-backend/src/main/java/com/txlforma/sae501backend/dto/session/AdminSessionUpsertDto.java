package com.txlforma.sae501backend.dto.session;

import com.txlforma.sae501backend.model.enums.StatutSession;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminSessionUpsertDto {

    @NotNull
    private Long formationId;

    private Long intervenantId;

    @NotNull
    private LocalDate dateDebut;

    @NotNull
    private LocalDate dateFin;

    private String salle;

    private Integer nbPlacesMax;

    private StatutSession statut;
}

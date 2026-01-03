package com.txlforma.sae501backend.dto.session;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignIntervenantDto {
    private Long intervenantId; // null => retirer l’intervenant
}

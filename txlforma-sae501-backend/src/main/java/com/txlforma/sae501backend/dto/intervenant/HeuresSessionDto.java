package com.txlforma.sae501backend.dto.intervenant;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HeuresSessionDto {
    private Long sessionId;
    private Double totalHeures;
    private Integer heuresTheoriques;
    private List<HeuresEntryDto> entries;
}

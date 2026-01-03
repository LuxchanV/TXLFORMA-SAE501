package com.txlforma.sae501backend.dto.intervenant;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AttestationMetaDto {
    private Long inscriptionId;
    private boolean hasAttestation;
    private String originalFilename;
    private LocalDateTime uploadedAt;
}

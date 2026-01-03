package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.intervenant.HeuresSessionDto;
import com.txlforma.sae501backend.dto.intervenant.HeuresSetRequestDto;

public interface HeuresService {
    HeuresSessionDto getHeuresSession(Long sessionId, String currentEmail);
    void setHeures(HeuresSetRequestDto dto, String currentEmail);
    Double getTotalHeuresFormateur(String currentEmail);
}

package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.admin.FormationResponseDto;
import com.txlforma.sae501backend.dto.admin.FormationUpsertDto;

import java.util.List;

public interface AdminFormationService {
    List<FormationResponseDto> lister(Long categorieId);
    FormationResponseDto get(Long id);
    FormationResponseDto creer(FormationUpsertDto dto);
    FormationResponseDto update(Long id, FormationUpsertDto dto);
    void supprimer(Long id);
}

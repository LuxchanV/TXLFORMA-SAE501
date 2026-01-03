package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.intervenant.IntervenantCreateDto;
import com.txlforma.sae501backend.dto.intervenant.IntervenantResponseDto;

import java.util.List;

public interface IntervenantService {
    IntervenantResponseDto creer(Long utilisateurId, IntervenantCreateDto dto);
    List<IntervenantResponseDto> lister();
    IntervenantResponseDto update(Long id, IntervenantCreateDto dto);
    void supprimer(Long id);
}

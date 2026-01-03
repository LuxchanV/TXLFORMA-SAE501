package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.admin.CategorieResponseDto;
import com.txlforma.sae501backend.dto.admin.CategorieUpsertDto;

import java.util.List;

public interface AdminCategorieService {
    List<CategorieResponseDto> lister();
    CategorieResponseDto get(Long id);
    CategorieResponseDto creer(CategorieUpsertDto dto);
    CategorieResponseDto update(Long id, CategorieUpsertDto dto);
    void supprimer(Long id);
}

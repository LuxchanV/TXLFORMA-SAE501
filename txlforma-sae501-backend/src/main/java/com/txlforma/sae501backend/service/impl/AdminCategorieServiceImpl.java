package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.admin.CategorieResponseDto;
import com.txlforma.sae501backend.dto.admin.CategorieUpsertDto;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.CategorieFormation;
import com.txlforma.sae501backend.repository.CategorieFormationRepository;
import com.txlforma.sae501backend.repository.FormationRepository;
import com.txlforma.sae501backend.service.AdminCategorieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCategorieServiceImpl implements AdminCategorieService {

    private final CategorieFormationRepository categorieRepo;
    private final FormationRepository formationRepo;

    @Override
    @Transactional(readOnly = true)
    public List<CategorieResponseDto> lister() {
        return categorieRepo.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategorieResponseDto get(Long id) {
        CategorieFormation c = categorieRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable"));
        return toDto(c);
    }

    @Override
    public CategorieResponseDto creer(CategorieUpsertDto dto) {
        CategorieFormation c = CategorieFormation.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .build();
        return toDto(categorieRepo.save(c));
    }

    @Override
    public CategorieResponseDto update(Long id, CategorieUpsertDto dto) {
        CategorieFormation c = categorieRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable"));

        c.setNom(dto.getNom());
        c.setDescription(dto.getDescription());

        return toDto(categorieRepo.save(c));
    }

    @Override
    public void supprimer(Long id) {
        if (!categorieRepo.existsById(id)) {
            throw new NotFoundException("Catégorie introuvable");
        }

        // Empêche suppression si encore utilisée par des formations
        if (formationRepo.existsByCategorie_Id(id)) {
            throw new ConflictException("Impossible : des formations utilisent encore cette catégorie");
        }

        categorieRepo.deleteById(id);
    }

    private CategorieResponseDto toDto(CategorieFormation c) {
        return CategorieResponseDto.builder()
                .id(c.getId())
                .nom(c.getNom())
                .description(c.getDescription())
                .build();
    }
}

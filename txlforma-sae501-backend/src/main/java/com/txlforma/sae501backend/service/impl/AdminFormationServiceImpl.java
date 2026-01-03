package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.admin.FormationResponseDto;
import com.txlforma.sae501backend.dto.admin.FormationUpsertDto;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.CategorieFormation;
import com.txlforma.sae501backend.model.entity.Formation;
import com.txlforma.sae501backend.repository.CategorieFormationRepository;
import com.txlforma.sae501backend.repository.FormationRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.service.AdminFormationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminFormationServiceImpl implements AdminFormationService {

    private final FormationRepository formationRepo;
    private final CategorieFormationRepository categorieRepo;
    private final SessionFormationRepository sessionRepo;

    @Override
    @Transactional(readOnly = true)
    public List<FormationResponseDto> lister(Long categorieId) {
        List<Formation> formations = (categorieId == null)
                ? formationRepo.findAllWithCategorie()
                : formationRepo.findByCategorieIdWithCategorie(categorieId);

        return formations.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FormationResponseDto get(Long id) {
        Formation f = formationRepo.findByIdWithCategorie(id)
                .orElseThrow(() -> new NotFoundException("Formation introuvable"));
        return toDto(f);
    }

    @Override
    public FormationResponseDto creer(FormationUpsertDto dto) {
        CategorieFormation c = categorieRepo.findById(dto.getCategorieId())
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable"));

        Formation f = Formation.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .dureeHeures(dto.getDureeHeures())
                .prix(dto.getPrix())
                .niveau(dto.getNiveau())
                .categorie(c)
                .build();

        return toDto(formationRepo.save(f));
    }

    @Override
    public FormationResponseDto update(Long id, FormationUpsertDto dto) {
        Formation f = formationRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Formation introuvable"));

        CategorieFormation c = categorieRepo.findById(dto.getCategorieId())
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable"));

        f.setTitre(dto.getTitre());
        f.setDescription(dto.getDescription());
        f.setDureeHeures(dto.getDureeHeures());
        f.setPrix(dto.getPrix());
        f.setNiveau(dto.getNiveau());
        f.setCategorie(c);

        Formation saved = formationRepo.save(f);
        // recharge catégorie pour DTO propre (si besoin)
        return get(saved.getId());
    }

    @Override
    public void supprimer(Long id) {
        if (!formationRepo.existsById(id)) {
            throw new NotFoundException("Formation introuvable");
        }

        // Empêche suppression si des sessions existent
        if (sessionRepo.existsByFormation_Id(id)) {
            throw new ConflictException("Impossible : des sessions existent pour cette formation");
        }

        formationRepo.deleteById(id);
    }

    private FormationResponseDto toDto(Formation f) {
        return FormationResponseDto.builder()
                .id(f.getId())
                .titre(f.getTitre())
                .description(f.getDescription())
                .dureeHeures(f.getDureeHeures())
                .prix(f.getPrix())
                .niveau(f.getNiveau())
                .categorieId(f.getCategorie() != null ? f.getCategorie().getId() : null)
                .categorieNom(f.getCategorie() != null ? f.getCategorie().getNom() : null)
                .build();
    }
}

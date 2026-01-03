package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.CategorieFormation;
import com.txlforma.sae501backend.model.entity.Formation;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.repository.CategorieFormationRepository;
import com.txlforma.sae501backend.repository.FormationRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.service.CatalogueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogueServiceImpl implements CatalogueService {

    private final CategorieFormationRepository categorieRepo;
    private final FormationRepository formationRepo;
    private final SessionFormationRepository sessionRepo;

    @Override
    public List<CategorieFormation> getCategories() {
        return categorieRepo.findAll();
    }

    @Override
    public List<Formation> getFormations(Long categorieId) {
        if (categorieId == null) return formationRepo.findAll();
        return formationRepo.findByCategorie_Id(categorieId);
    }

    @Override
    public Formation getFormation(Long id) {
        return formationRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Formation introuvable"));
    }

    @Override
    public List<SessionFormation> getSessionsByFormation(Long formationId) {
        return sessionRepo.findByFormationIdFull(formationId);
    }

    @Override
    public List<SessionFormation> getSessions(Long formationId) {
        if (formationId == null) return sessionRepo.findAllFull();
        return sessionRepo.findByFormationIdFull(formationId);
    }

    @Override
    public SessionFormation getSession(Long sessionId) {
        return sessionRepo.findByIdFull(sessionId)
                .orElseThrow(() -> new NotFoundException("Session introuvable"));
    }
}

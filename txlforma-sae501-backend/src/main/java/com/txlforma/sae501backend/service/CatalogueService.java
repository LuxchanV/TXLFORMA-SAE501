package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.model.entity.CategorieFormation;
import com.txlforma.sae501backend.model.entity.Formation;
import com.txlforma.sae501backend.model.entity.SessionFormation;

import java.util.List;

public interface CatalogueService {

    List<CategorieFormation> getCategories();

    List<Formation> getFormations(Long categorieId);

    Formation getFormation(Long id);

    // pour /formations/{id}/sessions
    List<SessionFormation> getSessionsByFormation(Long formationId);

    // pour /sessions?formationId=...
    List<SessionFormation> getSessions(Long formationId);

    SessionFormation getSession(Long sessionId);
}

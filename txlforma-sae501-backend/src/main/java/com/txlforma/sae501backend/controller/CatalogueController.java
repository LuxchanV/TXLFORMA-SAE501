package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.catalogue.CategorieDto;
import com.txlforma.sae501backend.dto.catalogue.FormationDto;
import com.txlforma.sae501backend.dto.catalogue.SessionDto;
import com.txlforma.sae501backend.service.CatalogueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogue")
@RequiredArgsConstructor
public class CatalogueController {

    private final CatalogueService catalogueService;

    @GetMapping("/categories")
    public List<CategorieDto> categories() {
        return catalogueService.getCategories().stream()
                .map(CategorieDto::fromEntity)
                .toList();
    }

    @GetMapping("/formations")
    public List<FormationDto> formations(@RequestParam(required = false) Long categorieId) {
        return catalogueService.getFormations(categorieId).stream()
                .map(FormationDto::fromEntity)
                .toList();
    }

    @GetMapping("/formations/{id}")
    public FormationDto formation(@PathVariable Long id) {
        return FormationDto.fromEntity(catalogueService.getFormation(id));
    }

    @GetMapping("/formations/{id}/sessions")
    public List<SessionDto> sessionsByFormation(@PathVariable Long id) {
        return catalogueService.getSessionsByFormation(id).stream()
                .map(SessionDto::fromEntity)
                .toList();
    }

    // ✅ NOUVEAU ENDPOINT
    @GetMapping("/sessions")
    public List<SessionDto> toutesLesSessions(@RequestParam(required = false) Long formationId) {
        return catalogueService.getSessions(formationId).stream()
                .map(SessionDto::fromEntity)
                .toList();
    }

    @GetMapping("/sessions/{id}")
    public SessionDto session(@PathVariable Long id) {
        return SessionDto.fromEntity(catalogueService.getSession(id));
    }
}

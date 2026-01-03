package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.admin.FormationResponseDto;
import com.txlforma.sae501backend.dto.admin.FormationUpsertDto;
import com.txlforma.sae501backend.service.AdminFormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/formations")
@RequiredArgsConstructor
public class AdminFormationController {

    private final AdminFormationService service;

    // filtre optionnel: /api/admin/formations?categorieId=1
    @GetMapping
    public List<FormationResponseDto> lister(@RequestParam(required = false) Long categorieId) {
        return service.lister(categorieId);
    }

    @GetMapping("/{id}")
    public FormationResponseDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<FormationResponseDto> creer(@Valid @RequestBody FormationUpsertDto dto) {
        return ResponseEntity.status(201).body(service.creer(dto));
    }

    @PutMapping("/{id}")
    public FormationResponseDto update(@PathVariable Long id, @Valid @RequestBody FormationUpsertDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}

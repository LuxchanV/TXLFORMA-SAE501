package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.intervenant.AdminIntervenantUpsertDto;
import com.txlforma.sae501backend.dto.intervenant.IntervenantCreateDto;
import com.txlforma.sae501backend.dto.intervenant.IntervenantResponseDto;
import com.txlforma.sae501backend.service.IntervenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/intervenants")
@RequiredArgsConstructor
public class AdminIntervenantController {

    private final IntervenantService intervenantService;

    // ✅ CREATE (body JSON)
    @PostMapping
    public ResponseEntity<IntervenantResponseDto> creer(@Valid @RequestBody AdminIntervenantUpsertDto dto) {
        IntervenantCreateDto createDto = new IntervenantCreateDto();
        createDto.setSpecialite(dto.getSpecialite());
        createDto.setStatut(dto.getStatut());
        createDto.setTauxHoraire(dto.getTauxHoraire());

        return ResponseEntity.status(201).body(intervenantService.creer(dto.getUtilisateurId(), createDto));
    }

    // ✅ READ
    @GetMapping
    public ResponseEntity<List<IntervenantResponseDto>> lister() {
        return ResponseEntity.ok(intervenantService.lister());
    }

    // ✅ UPDATE (body JSON)
    @PutMapping("/{id}")
    public ResponseEntity<IntervenantResponseDto> update(@PathVariable Long id, @Valid @RequestBody AdminIntervenantUpsertDto dto) {
        IntervenantCreateDto updateDto = new IntervenantCreateDto();
        updateDto.setSpecialite(dto.getSpecialite());
        updateDto.setStatut(dto.getStatut());
        updateDto.setTauxHoraire(dto.getTauxHoraire());

        return ResponseEntity.ok(intervenantService.update(id, updateDto));
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        intervenantService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}

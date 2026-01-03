package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.admin.CategorieResponseDto;
import com.txlforma.sae501backend.dto.admin.CategorieUpsertDto;
import com.txlforma.sae501backend.service.AdminCategorieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategorieController {

    private final AdminCategorieService service;

    @GetMapping
    public List<CategorieResponseDto> lister() {
        return service.lister();
    }

    @GetMapping("/{id}")
    public CategorieResponseDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<CategorieResponseDto> creer(@Valid @RequestBody CategorieUpsertDto dto) {
        return ResponseEntity.status(201).body(service.creer(dto));
    }

    @PutMapping("/{id}")
    public CategorieResponseDto update(@PathVariable Long id, @Valid @RequestBody CategorieUpsertDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}

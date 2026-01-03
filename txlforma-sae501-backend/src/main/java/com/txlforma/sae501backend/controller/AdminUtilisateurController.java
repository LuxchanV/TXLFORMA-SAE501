package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.admin.*;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.service.AdminUtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/utilisateurs")
@RequiredArgsConstructor
public class AdminUtilisateurController {

    private final AdminUtilisateurService service;

    // /api/admin/utilisateurs?q=dupont&role=ROLE_USER&actif=true
    @GetMapping
    public List<AdminUserResponseDto> lister(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean actif
    ) {
        return service.lister(q, role, actif);
    }

    @GetMapping("/{id}")
    public AdminUserResponseDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public AdminUserResponseDto update(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/role")
    public AdminUserResponseDto changerRole(@PathVariable Long id, @Valid @RequestBody AdminUserRoleDto dto) {
        return service.changerRole(id, dto.getRole());
    }

    @PatchMapping("/{id}/actif")
    public AdminUserResponseDto changerActif(@PathVariable Long id, @Valid @RequestBody AdminUserActifDto dto) {
        return service.changerActif(id, dto.getActif());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}

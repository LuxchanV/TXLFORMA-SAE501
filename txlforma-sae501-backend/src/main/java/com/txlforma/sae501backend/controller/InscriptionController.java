package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.inscription.InscriptionCreateDto;
import com.txlforma.sae501backend.dto.inscription.InscriptionDto;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.service.InscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
public class InscriptionController {

    private final InscriptionService inscriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InscriptionDto creer(@Valid @RequestBody InscriptionCreateDto dto) {
        Inscription ins = inscriptionService.creerInscription(dto.getSessionId());
        return InscriptionDto.fromEntity(ins);
    }

    @GetMapping("/me")
    public List<InscriptionDto> mesInscriptions() {
        return inscriptionService.mesInscriptions()
                .stream()
                .map(InscriptionDto::fromEntity)
                .toList();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void annuler(@PathVariable Long id) {
        inscriptionService.annulerInscription(id);
    }
}

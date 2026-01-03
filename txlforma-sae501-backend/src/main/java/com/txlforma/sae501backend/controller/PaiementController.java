package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.paiement.*;
import com.txlforma.sae501backend.service.PaiementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    @PostMapping("/simuler")
    public PaiementDto simuler(@Valid @RequestBody PaiementSimulerDto dto) {
        return PaiementDto.fromEntity(paiementService.simulerPaiement(dto.getInscriptionId()));
    }

    @GetMapping("/inscription/{inscriptionId}")
    public List<PaiementDto> parInscription(@PathVariable Long inscriptionId) {
        return paiementService.paiementsParInscription(inscriptionId).stream().map(PaiementDto::fromEntity).toList();
    }
}

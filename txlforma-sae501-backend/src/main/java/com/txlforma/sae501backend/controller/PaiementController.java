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

    // ✅ NEW : crée un checkout (paiement EN_ATTENTE)
    @PostMapping("/checkout")
    public PaiementCheckoutResponseDto checkout(@Valid @RequestBody PaiementCheckoutRequestDto dto) {
        return PaiementCheckoutResponseDto.fromEntity(
                paiementService.creerCheckout(dto.getInscriptionId())
        );
    }

    // ✅ NEW : confirme un paiement CB test (SUCCES / ECHEC)
    @PostMapping("/confirm/{paiementId}")
    public PaiementDto confirm(@PathVariable Long paiementId, @RequestBody PaiementConfirmRequestDto dto) {
        return PaiementDto.fromEntity(
                paiementService.confirmerCheckout(paiementId, dto)
        );
    }

    // ✅ garde ton simulate (bouton rapide)
    @PostMapping("/simuler")
    public PaiementDto simuler(@Valid @RequestBody PaiementSimulerDto dto) {
        return PaiementDto.fromEntity(
                paiementService.simulerPaiement(dto.getInscriptionId())
        );
    }

    // ✅ liste paiements d’une inscription
    @GetMapping("/inscription/{inscriptionId}")
    public List<PaiementDto> parInscription(@PathVariable Long inscriptionId) {
        return paiementService.paiementsParInscription(inscriptionId)
                .stream()
                .map(PaiementDto::fromEntity)
                .toList();
    }
}

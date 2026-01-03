package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.evaluation.EvaluationDto;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.service.EvaluationService;
import com.txlforma.sae501backend.service.InscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final InscriptionService inscriptionService;

    // ✅ USER (ou ADMIN) peut lire l’évaluation de SA propre inscription
    @GetMapping("/inscription/{inscriptionId}")
    public EvaluationDto evaluationParInscription(@PathVariable Long inscriptionId) {
        // sécurité : owner ou admin (tu l’as déjà dans ton service)
        Inscription ins = inscriptionService.getInscriptionForCurrentUserOrAdmin(inscriptionId);

        return EvaluationDto.fromEntity(
                evaluationService.getEvaluation(ins.getId())
        );
    }
}

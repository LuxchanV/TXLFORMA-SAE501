package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.inscription.AdminInscriptionStatutDto;
import com.txlforma.sae501backend.dto.inscription.InscriptionDto;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inscriptions")
@RequiredArgsConstructor
public class AdminInscriptionController {

    private final InscriptionRepository inscriptionRepository;

    // ✅ LIST + filtres optionnels
    // /api/admin/inscriptions?statut=PAYEE&sessionId=1&formationId=2&utilisateurId=3
    @GetMapping
    public List<InscriptionDto> lister(
            @RequestParam(required = false) StatutInscription statut,
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) Long formationId,
            @RequestParam(required = false) Long utilisateurId
    ) {
        return inscriptionRepository.searchAdmin(statut, sessionId, formationId, utilisateurId)
                .stream()
                .map(InscriptionDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public InscriptionDto get(@PathVariable Long id) {
        Inscription ins = inscriptionRepository.findByIdFull(id)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));
        return InscriptionDto.fromEntity(ins);
    }

    // ✅ CHANGER LE STATUT
    // body: { "statut": "PAYEE" } ou { "statut": "ANNULEE" } ou { "statut": "EN_ATTENTE_PAIEMENT" }
    @PatchMapping("/{id}/statut")
    public InscriptionDto changerStatut(@PathVariable Long id, @Valid @RequestBody AdminInscriptionStatutDto dto) {
        Inscription ins = inscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        ins.setStatut(dto.getStatut());
        inscriptionRepository.save(ins);

        // renvoi full pour éviter Lazy dans le DTO
        Inscription full = inscriptionRepository.findByIdFull(id)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));
        return InscriptionDto.fromEntity(full);
    }

    // ✅ Actions simples
    @PostMapping("/{id}/valider")
    @ResponseStatus(HttpStatus.OK)
    public InscriptionDto valider(@PathVariable Long id) {
        AdminInscriptionStatutDto dto = new AdminInscriptionStatutDto();
        dto.setStatut(StatutInscription.PAYEE);
        return changerStatut(id, dto);
    }

    @PostMapping("/{id}/refuser")
    @ResponseStatus(HttpStatus.OK)
    public InscriptionDto refuser(@PathVariable Long id) {
        AdminInscriptionStatutDto dto = new AdminInscriptionStatutDto();
        dto.setStatut(StatutInscription.ANNULEE);
        return changerStatut(id, dto);
    }
}

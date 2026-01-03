package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.paiement.AdminPaiementCreateDto;
import com.txlforma.sae501backend.dto.paiement.AdminPaiementStatutDto;
import com.txlforma.sae501backend.dto.paiement.PaiementDto;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.PaiementRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/paiements")
@RequiredArgsConstructor
public class AdminPaiementController {

    private final PaiementRepository paiementRepository;
    private final InscriptionRepository inscriptionRepository;

    // ✅ LIST + filtres optionnels
    // /api/admin/paiements?inscriptionId=1&utilisateurId=2&statut=SUCCES
    @GetMapping
    public List<PaiementDto> lister(
            @RequestParam(required = false) Long inscriptionId,
            @RequestParam(required = false) Long utilisateurId,
            @RequestParam(required = false) StatutPaiement statut
    ) {
        return paiementRepository.searchAdmin(inscriptionId, utilisateurId, statut)
                .stream()
                .map(PaiementDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public PaiementDto get(@PathVariable Long id) {
        Paiement p = paiementRepository.findByIdFull(id)
                .orElseThrow(() -> new NotFoundException("Paiement introuvable"));
        return PaiementDto.fromEntity(p);
    }

    // ✅ CREATE (marquer un paiement reçu)
    @PostMapping
    public ResponseEntity<PaiementDto> creer(@Valid @RequestBody AdminPaiementCreateDto dto) {
        Inscription ins = inscriptionRepository.findById(dto.getInscriptionId())
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        Paiement p = new Paiement();
        p.setInscription(ins);
        p.setMontant(dto.getMontant());
        if (dto.getModePaiement() != null && !dto.getModePaiement().isBlank()) {
            p.setModePaiement(dto.getModePaiement());
        } else {
            p.setModePaiement("ADMIN");
        }
        if (dto.getStatut() != null) {
            p.setStatut(dto.getStatut());
        } else {
            p.setStatut(StatutPaiement.SUCCES);
        }

        if (dto.getReferenceExterne() != null && !dto.getReferenceExterne().isBlank()) {
            p.setReferenceExterne(dto.getReferenceExterne());
        }

        Paiement saved = paiementRepository.save(p);

        // si paiement succès => inscription PAYEE
        if (saved.getStatut() == StatutPaiement.SUCCES) {
            ins.setStatut(StatutInscription.PAYEE);
            inscriptionRepository.save(ins);
        }

        return ResponseEntity.status(201).body(PaiementDto.fromEntity(saved));
    }

    // ✅ UPDATE statut paiement
    @PatchMapping("/{id}/statut")
    public PaiementDto changerStatut(@PathVariable Long id, @Valid @RequestBody AdminPaiementStatutDto dto) {
        Paiement p = paiementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paiement introuvable"));

        p.setStatut(dto.getStatut());
        Paiement saved = paiementRepository.save(p);

        // si devient succès => inscription PAYEE
        if (saved.getStatut() == StatutPaiement.SUCCES) {
            Inscription ins = saved.getInscription();
            if (ins != null) {
                ins.setStatut(StatutInscription.PAYEE);
                inscriptionRepository.save(ins);
            }
        }

        return PaiementDto.fromEntity(saved);
    }
}

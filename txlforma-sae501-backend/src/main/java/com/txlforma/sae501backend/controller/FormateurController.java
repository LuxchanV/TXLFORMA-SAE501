package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.emargement.EmargementMarquerDto;
import com.txlforma.sae501backend.dto.evaluation.EvaluationCreateDto;
import com.txlforma.sae501backend.dto.intervenant.*;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.service.AttestationService;
import com.txlforma.sae501backend.service.EmargementService;
import com.txlforma.sae501backend.service.EvaluationService;
import com.txlforma.sae501backend.service.HeuresService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/api/intervenant", "/api/formateur"})
@RequiredArgsConstructor
public class FormateurController {

    private final SessionFormationRepository sessionRepo;
    private final InscriptionRepository inscriptionRepo;

    private final EmargementService emargementService;
    private final EvaluationService evaluationService;

    private final AttestationService attestationService;
    private final HeuresService heuresService;

    // -----------------------------
    // Sessions + Participants
    // -----------------------------
    @GetMapping("/sessions")
    public List<IntervenantSessionDto> mesSessions() {
        String email = currentEmail();
        return sessionRepo.findByIntervenant_Utilisateur_Email(email)
                .stream()
                .map(IntervenantSessionDto::fromEntity)
                .toList();
    }

    @GetMapping("/sessions/{sessionId}/participants")
    public List<IntervenantParticipantDto> participants(@PathVariable Long sessionId) {
        String email = currentEmail();

        sessionRepo.findByIdAndIntervenant_Utilisateur_Email(sessionId, email)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : session non assignée à cet intervenant"));

        return inscriptionRepo.findBySessionIdWithUtilisateur(sessionId)
                .stream()
                .map(IntervenantParticipantDto::fromEntity)
                .toList();
    }

    // -----------------------------
    // Émargement
    // -----------------------------
    @PostMapping("/emargement")
    public ResponseEntity<Void> marquer(@Valid @RequestBody EmargementMarquerDto dto) {
        String email = currentEmail();

        Inscription ins = inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(dto.getInscriptionId(), email)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        if (isSessionLocked(ins.getSession())) {
            throw new ForbiddenException("Session clôturée/annulée : émargement interdit.");
        }

        emargementService.marquerPresence(dto.getInscriptionId(), dto.getDateJour(), dto.getPresent());
        return ResponseEntity.noContent().build();
    }

    // -----------------------------
    // Évaluations
    // -----------------------------
    @PostMapping("/evaluations")
    public ResponseEntity<Void> eval(@Valid @RequestBody EvaluationCreateDto dto) {
        String email = currentEmail();

        Inscription ins = inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(dto.getInscriptionId(), email)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        if (isSessionLocked(ins.getSession())) {
            throw new ForbiddenException("Session clôturée/annulée : évaluation interdite.");
        }

        evaluationService.enregistrerEvaluation(dto.getInscriptionId(), dto.getNote(), dto.getCommentaire());
        return ResponseEntity.noContent().build();
    }

    // -----------------------------
    // Attestations
    // -----------------------------
    @GetMapping("/sessions/{sessionId}/attestations")
    public List<AttestationMetaDto> listAttestations(@PathVariable Long sessionId) {
        String email = currentEmail();
        return attestationService.listBySession(sessionId, email);
    }

    @PostMapping(value = "/attestations/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AttestationMetaDto uploadAttestation(
            @RequestParam("inscriptionId") Long inscriptionId,
            @RequestPart("file") MultipartFile file
    ) {
        String email = currentEmail();
        return attestationService.upload(inscriptionId, file, email);
    }

    @PostMapping("/attestations/{inscriptionId}/generate")
    public AttestationMetaDto generateAttestation(@PathVariable Long inscriptionId) {
        String email = currentEmail();
        return attestationService.generate(inscriptionId, email);
    }

    @GetMapping("/attestations/{inscriptionId}/download")
    public ResponseEntity<Resource> downloadAttestation(@PathVariable Long inscriptionId) {
        String email = currentEmail();

        Resource res = attestationService.download(inscriptionId, email);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("attestation-" + inscriptionId + ".pdf")
                        .build()
        );

        return ResponseEntity.ok().headers(headers).body(res);
    }

    // -----------------------------
    // Heures réalisées
    // -----------------------------
    @GetMapping("/sessions/{sessionId}/heures")
    public HeuresSessionDto getHeures(@PathVariable Long sessionId) {
        String email = currentEmail();
        return heuresService.getHeuresSession(sessionId, email);
    }

    @PostMapping("/heures")
    public ResponseEntity<Void> setHeures(@Valid @RequestBody HeuresSetRequestDto dto) {
        String email = currentEmail();
        heuresService.setHeures(dto, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/heures/total")
    public double totalHeures() {
        String email = currentEmail();
        Double t = heuresService.getTotalHeuresFormateur(email);
        return t == null ? 0d : t;
    }

    // -----------------------------
    // Helpers
    // -----------------------------
    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new NotFoundException("Utilisateur courant introuvable");
        }
        return auth.getName();
    }

    private boolean isSessionLocked(SessionFormation s) {
        if (s == null || s.getStatut() == null) return false;
        String st = s.getStatut().name().toUpperCase();
        return st.contains("FERM") || st.contains("ANNUL") || st.contains("CLOT");
    }
}

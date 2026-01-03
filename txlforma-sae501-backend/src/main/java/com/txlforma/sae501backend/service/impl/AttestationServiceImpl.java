package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.intervenant.AttestationMetaDto;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Attestation;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.repository.AttestationRepository;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.service.AttestationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AttestationServiceImpl implements AttestationService {

    private final AttestationRepository attestationRepo;
    private final InscriptionRepository inscriptionRepo;
    private final SessionFormationRepository sessionRepo;

    @Override
    @Transactional(readOnly = true)
    public byte[] genererPdfPourInscription(Long inscriptionId) {
        Attestation a = attestationRepo.findByInscription_Id(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Aucune attestation pour cette inscription"));
        return a.getData();
    }

    @Override
    public AttestationMetaDto upload(Long inscriptionId, MultipartFile file, String currentEmail) {
        if (file == null || file.isEmpty()) throw new NotFoundException("Fichier manquant");

        // sécurité : l’inscription doit être dans une session du formateur
        Inscription ins = inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(inscriptionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        // ✅ règle : session fermée/annulée = plus de modif
        SessionFormation s = ins.getSession();
        if (isSessionLocked(s)) {
            throw new ForbiddenException("Session clôturée/annulée : upload attestation interdit.");
        }

        // ✅ règle : upload UNIQUEMENT si PAYÉE (côté backend)
        if (!isInscriptionPayee(ins)) {
            throw new ForbiddenException("Upload attestation interdit : inscription non PAYÉE.");
        }

        String ct = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String name = file.getOriginalFilename() == null ? "attestation.pdf" : file.getOriginalFilename();

        if (!ct.contains("pdf") && !name.toLowerCase().endsWith(".pdf")) {
            throw new NotFoundException("Seuls les fichiers PDF sont acceptés");
        }

        try {
            Attestation a = attestationRepo.findByInscription_Id(inscriptionId)
                    .orElseGet(() -> Attestation.builder().inscription(ins).build());

            a.setOriginalFilename(name);
            a.setContentType("application/pdf");
            a.setUploadedAt(LocalDateTime.now());
            a.setData(file.getBytes());

            Attestation saved = attestationRepo.save(a);

            return AttestationMetaDto.builder()
                    .inscriptionId(inscriptionId)
                    .hasAttestation(true)
                    .originalFilename(saved.getOriginalFilename())
                    .uploadedAt(saved.getUploadedAt())
                    .build();

        } catch (Exception e) {
            throw new NotFoundException("Upload impossible: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Resource download(Long inscriptionId, String currentEmail) {
        inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(inscriptionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        Attestation a = attestationRepo.findByInscription_Id(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Aucune attestation pour cette inscription"));

        return new ByteArrayResource(a.getData());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttestationMetaDto> listBySession(Long sessionId, String currentEmail) {
        sessionRepo.findByIdAndIntervenant_Utilisateur_Email(sessionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : session non assignée à cet intervenant"));

        List<Inscription> inscriptions = inscriptionRepo.findBySessionIdWithUtilisateur(sessionId);

        List<Attestation> atts = attestationRepo.findByInscription_Session_Id(sessionId);
        Map<Long, Attestation> map = new HashMap<>();
        for (Attestation a : atts) {
            map.put(a.getInscription().getId(), a);
        }

        return inscriptions.stream().map(ins -> {
            Attestation a = map.get(ins.getId());
            return AttestationMetaDto.builder()
                    .inscriptionId(ins.getId())
                    .hasAttestation(a != null)
                    .originalFilename(a != null ? a.getOriginalFilename() : null)
                    .uploadedAt(a != null ? a.getUploadedAt() : null)
                    .build();
        }).toList();
    }

    private boolean isSessionLocked(SessionFormation s) {
        if (s == null || s.getStatut() == null) return false;
        String st = s.getStatut().name().toUpperCase();
        return st.contains("FERM") || st.contains("ANNUL") || st.contains("CLOT");
    }

    private boolean isInscriptionPayee(Inscription ins) {
        if (ins == null || ins.getStatut() == null) return false;
        String st = ins.getStatut().name().toUpperCase();
        return st.contains("PAYE"); // PAYE / PAYEE / PAYÉE
    }
}

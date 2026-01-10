package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.intervenant.AttestationMetaDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttestationService {

    // USER download (Controller /api/attestations/inscription/{id})
    byte[] genererPdfPourInscription(Long inscriptionId);

    // Formateur: upload/download + liste
    AttestationMetaDto upload(Long inscriptionId, MultipartFile file, String currentEmail);
    Resource download(Long inscriptionId, String currentEmail);
    List<AttestationMetaDto> listBySession(Long sessionId, String currentEmail);

    // ✅ bouton "Générer l'attestation" (formateur)
    AttestationMetaDto generate(Long inscriptionId, String currentEmail);

    // ✅ génération automatique après validation d’évaluation
    // Ne remplace PAS une attestation MANUAL existante
    void autoGenerateAfterEvaluationIfAllowed(Long inscriptionId, String currentEmail);
}

package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.intervenant.AttestationMetaDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttestationService {

    // ✅ pour ton AttestationController (/api/attestations/inscription/{id})
    byte[] genererPdfPourInscription(Long inscriptionId);

    // ✅ pour le formateur (upload/download + liste)
    AttestationMetaDto upload(Long inscriptionId, MultipartFile file, String currentEmail);
    Resource download(Long inscriptionId, String currentEmail);
    List<AttestationMetaDto> listBySession(Long sessionId, String currentEmail);
}

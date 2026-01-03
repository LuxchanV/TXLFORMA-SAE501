package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.service.AttestationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attestations")
@RequiredArgsConstructor
public class AttestationController {

    private final AttestationService attestationService;

    @GetMapping("/inscription/{inscriptionId}")
    public ResponseEntity<byte[]> attestation(@PathVariable Long inscriptionId) {
        byte[] pdf = attestationService.genererPdfPourInscription(inscriptionId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("attestation-inscription-" + inscriptionId + ".pdf")
                        .build()
        );

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}

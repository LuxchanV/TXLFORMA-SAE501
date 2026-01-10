package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.intervenant.AttestationMetaDto;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Attestation;
import com.txlforma.sae501backend.model.entity.Evaluation;
import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.AttestationSource;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.AttestationRepository;
import com.txlforma.sae501backend.repository.EvaluationRepository;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.AttestationService;
import com.txlforma.sae501backend.service.pdf.AttestationPdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class AttestationServiceImpl implements AttestationService {

    private final AttestationRepository attestationRepo;
    private final InscriptionRepository inscriptionRepo;
    private final SessionFormationRepository sessionRepo;
    private final EvaluationRepository evaluationRepo;
    private final UtilisateurRepository utilisateurRepo;

    private final AttestationPdfGenerator pdfGenerator;

    private static final DateTimeFormatter FR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRANCE);

    // -----------------------------
    // USER DOWNLOAD (sécurisé)
    // -----------------------------
    @Override
    @Transactional(readOnly = true)
    public byte[] genererPdfPourInscription(Long inscriptionId) {

        Utilisateur current = getCurrentUser();

        Attestation a = attestationRepo.findByInscription_Id(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Aucune attestation pour cette inscription"));

        // Vérif accès : admin OU owner OU formateur session
        Inscription ins = a.getInscription();
        ensureOwnerOrAdminOrFormateurDeLaSession(current, ins);

        if (a.getData() == null || a.getData().length == 0) {
            throw new NotFoundException("Attestation invalide : PDF manquant.");
        }

        return a.getData();
    }

    // -----------------------------
    // FORMATEUR : UPLOAD MANUAL
    // -----------------------------
    @Override
    public AttestationMetaDto upload(Long inscriptionId, MultipartFile file, String currentEmail) {
        if (file == null || file.isEmpty()) throw new NotFoundException("Fichier manquant");

        Inscription ins = inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(inscriptionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        SessionFormation s = ins.getSession();
        if (isSessionLocked(s)) {
            throw new ForbiddenException("Session clôturée/annulée : upload attestation interdit.");
        }
        if (!isInscriptionPayee(ins)) {
            throw new ForbiddenException("Upload attestation interdit : inscription non PAYÉE.");
        }

        String ct = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String name = file.getOriginalFilename() == null ? "attestation.pdf" : file.getOriginalFilename();

        if (!ct.contains("pdf") && !name.toLowerCase().endsWith(".pdf")) {
            throw new NotFoundException("Seuls les fichiers PDF sont acceptés");
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes == null || bytes.length == 0) {
                throw new NotFoundException("PDF vide");
            }

            Attestation a = attestationRepo.findByInscription_Id(inscriptionId)
                    .orElseGet(() -> Attestation.builder().inscription(ins).build());

            a.setOriginalFilename(name);
            a.setContentType("application/pdf");
            a.setUploadedAt(LocalDateTime.now());
            a.setSource(AttestationSource.MANUAL);
            a.setData(bytes);

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

    // -----------------------------
    // FORMATEUR : DOWNLOAD
    // -----------------------------
    @Override
    @Transactional(readOnly = true)
    public Resource download(Long inscriptionId, String currentEmail) {
        inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(inscriptionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        Attestation a = attestationRepo.findByInscription_Id(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Aucune attestation pour cette inscription"));

        if (a.getData() == null || a.getData().length == 0) {
            throw new NotFoundException("Attestation invalide : PDF manquant.");
        }

        return new ByteArrayResource(a.getData());
    }

    // -----------------------------
    // FORMATEUR : LISTE SESSION
    // -----------------------------
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
                    .hasAttestation(a != null && a.getData() != null && a.getData().length > 0)
                    .originalFilename(a != null ? a.getOriginalFilename() : null)
                    .uploadedAt(a != null ? a.getUploadedAt() : null)
                    .build();
        }).toList();
    }

    // -----------------------------
    // ✅ FORMATEUR : GENERATE (bouton)
    // -----------------------------
    @Override
    public AttestationMetaDto generate(Long inscriptionId, String currentEmail) {

        Inscription ins = inscriptionRepo.findByIdAndSession_Intervenant_Utilisateur_Email(inscriptionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : inscription hors de vos sessions"));

        SessionFormation s = ins.getSession();
        if (isSessionLocked(s)) throw new ForbiddenException("Session clôturée/annulée : génération interdite.");
        if (!isInscriptionPayee(ins)) throw new ForbiddenException("Génération interdite : inscription non PAYÉE.");

        Evaluation eval = evaluationRepo.findByInscription_Id(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Impossible de générer : aucune évaluation pour cette inscription."));

        // overwrite ok (choix formateur) => remplace même un MANUAL si formateur force
        Attestation saved = upsertGeneratedAttestation(ins, eval, true);

        return AttestationMetaDto.builder()
                .inscriptionId(inscriptionId)
                .hasAttestation(true)
                .originalFilename(saved.getOriginalFilename())
                .uploadedAt(saved.getUploadedAt())
                .build();
    }

    // -----------------------------
    // ✅ AUTO après évaluation (ne remplace pas MANUAL)
    // -----------------------------
    @Override
    public void autoGenerateAfterEvaluationIfAllowed(Long inscriptionId, String currentEmail) {
        Inscription ins = inscriptionRepo.findById(inscriptionId)
                .orElseThrow(() -> new NotFoundException("Inscription introuvable"));

        Utilisateur current = utilisateurRepo.findByEmail(currentEmail)
                .orElseThrow(() -> new NotFoundException("Utilisateur courant introuvable"));
        ensureFormateurDeLaSessionOrAdmin(current, ins.getSession());

        if (!isInscriptionPayee(ins)) return;
        if (isSessionLocked(ins.getSession())) return;

        Optional<Attestation> existing = attestationRepo.findByInscription_Id(inscriptionId);
        if (existing.isPresent() && existing.get().getSource() == AttestationSource.MANUAL) {
            return; // ne jamais écraser un upload
        }

        Evaluation eval = evaluationRepo.findByInscription_Id(inscriptionId).orElse(null);
        if (eval == null) return;

        upsertGeneratedAttestation(ins, eval, true);
    }

    // -----------------------------
    // Core génération + sauvegarde (SANS save() "vide")
    // -----------------------------
    private Attestation upsertGeneratedAttestation(Inscription ins, Evaluation eval, boolean overwriteData) {

        Attestation a = attestationRepo.findByInscription_Id(ins.getId())
                .orElseGet(() -> Attestation.builder().inscription(ins).build());

        String reference = buildReference(ins.getId(), LocalDate.now());

        // construire les datas du PDF
        String prenom = ins.getUtilisateur() != null ? safe(ins.getUtilisateur().getPrenom()) : "";
        String nom = ins.getUtilisateur() != null ? safe(ins.getUtilisateur().getNom()) : "";

        String formationTitre = "Formation";
        String salle = null;

        SessionFormation s = ins.getSession();
        if (s != null) {
            if (s.getFormation() != null && StringUtils.hasText(s.getFormation().getTitre())) {
                formationTitre = s.getFormation().getTitre();
            }
            salle = s.getSalle();
        }

        String dateDebut = "";
        String dateFin = "";
        if (s != null) {
            if (s.getDateDebut() != null) dateDebut = s.getDateDebut().format(FR_DATE);
            if (s.getDateFin() != null) dateFin = s.getDateFin().format(FR_DATE);
        }

        AttestationPdfGenerator.AttestationData data = AttestationPdfGenerator.AttestationData.builder()
                .reference(reference)
                .dateDelivrance(LocalDate.now())
                .apprenantPrenom(prenom)
                .apprenantNom(nom)
                .formationTitre(formationTitre)
                .sessionDebut(dateDebut)
                .sessionFin(dateFin)
                .sessionSalle(safe(salle))
                .note(eval.getNote())
                .commentaire(eval.getCommentaire())
                .build();

        byte[] pdfBytes = pdfGenerator.generateOfficialPdf(data);

        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new IllegalStateException("PDF généré vide : génération attestation échouée.");
        }

        // champs obligatoires
        a.setContentType("application/pdf");
        a.setUploadedAt(LocalDateTime.now());
        a.setSource(AttestationSource.AUTO);

        if (overwriteData || a.getData() == null || a.getData().length == 0) {
            a.setData(pdfBytes);
            a.setOriginalFilename("attestation-" + reference + ".pdf");
        }

        return attestationRepo.save(a);
    }

    private String buildReference(Long inscriptionId, LocalDate date) {
        // référence stable, unique, “officielle”
        // ex: ATTEST-2026-000123-20260110
        return "ATTEST-" + date.getYear()
                + "-" + String.format(Locale.ROOT, "%06d", inscriptionId)
                + "-" + date.format(DateTimeFormatter.BASIC_ISO_DATE);
    }

    // -----------------------------
    // Helpers règles
    // -----------------------------
    private boolean isSessionLocked(SessionFormation s) {
        if (s == null || s.getStatut() == null) return false;
        String st = s.getStatut().name().toUpperCase();
        return st.contains("FERM") || st.contains("ANNUL") || st.contains("CLOT");
    }

    private boolean isInscriptionPayee(Inscription ins) {
        if (ins == null || ins.getStatut() == null) return false;
        String st = ins.getStatut().name().toUpperCase();
        return st.contains("PAYE");
    }

    private String safe(String v) {
        return v == null ? "" : v.trim();
    }

    // -----------------------------
    // Sécurité (user download)
    // -----------------------------
    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ForbiddenException("Non authentifié");
        }
        return utilisateurRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("Utilisateur courant introuvable"));
    }

    private void ensureOwnerOrAdminOrFormateurDeLaSession(Utilisateur current, Inscription ins) {
        boolean isAdmin = current.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = ins.getUtilisateur() != null && ins.getUtilisateur().getId().equals(current.getId());
        if (isAdmin || isOwner) return;

        ensureFormateurDeLaSessionOrAdmin(current, ins.getSession());
    }

    private void ensureFormateurDeLaSessionOrAdmin(Utilisateur current, SessionFormation session) {
        if (current.getRole() == Role.ROLE_ADMIN) return;

        if (session == null || session.getIntervenant() == null || session.getIntervenant().getUtilisateur() == null) {
            throw new ForbiddenException("Aucun intervenant assigné à cette session");
        }
        Long formateurUserId = session.getIntervenant().getUtilisateur().getId();
        if (!formateurUserId.equals(current.getId())) {
            throw new ForbiddenException("Vous n'êtes pas l'intervenant de cette session");
        }
    }
}

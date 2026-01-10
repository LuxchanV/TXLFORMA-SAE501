package com.txlforma.sae501backend.service.pdf;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.txlforma.sae501backend.config.AttestationProperties;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.util.StringUtils;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttestationPdfGenerator {

    private final AttestationProperties props;
    private final ResourceLoader resourceLoader;

    private static final DateTimeFormatter FR_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRANCE);

    @Builder
    public static class AttestationData {
        public String reference;
        public LocalDate dateDelivrance;

        public String apprenantPrenom;
        public String apprenantNom;

        public String formationTitre;
        public String sessionDebut;  // déjà formaté
        public String sessionFin;    // déjà formaté
        public String sessionSalle;  // optionnel

        public Double note;          // /20
        public String commentaire;   // optionnel
    }

    public byte[] generateOfficialPdf(AttestationData d) {
        // 1) si template activé + trouvé => on l’utilise
        if (props.getTemplate() != null
                && props.getTemplate().isEnabled()
                && StringUtils.hasText(props.getTemplate().getPath())) {
            try {
                Resource tplRes = resourceLoader.getResource(props.getTemplate().getPath());
                if (tplRes.exists()) {
                    byte[] tplBytes = StreamUtils.copyToByteArray(tplRes.getInputStream());
                    return fillTemplatePdf(tplBytes, d);
                } else {
                    log.warn("Template activé mais introuvable: {}", props.getTemplate().getPath());
                }
            } catch (Exception e) {
                log.warn("Échec template PDF, fallback en génération code: {}", e.getMessage());
            }
        }

        // 2) fallback “from scratch” (propre et officiel)
        return generateFromScratch(d);
    }

    /**
     * Remplissage d’un template PDF (AcroForm).
     * Champs attendus (ex) :
     *  - ref, date, prenom, nom, formation, dateDebut, dateFin, salle, note, commentaire
     *  - organismeNom, organismeAdresse, organismeVille, organismeEmail, organismeTelephone, organismeSiret
     *  - signataireNom, signataireFonction
     */
    private byte[] fillTemplatePdf(byte[] templatePdf, AttestationData d) {
        try {
            PdfReader reader = new PdfReader(templatePdf);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfStamper stamper = new PdfStamper(reader, baos);

            AcroFields form = stamper.getAcroFields();

            Map<String, String> fields = Map.ofEntries(
                    Map.entry("ref", nn(d.reference)),
                    Map.entry("date", d.dateDelivrance != null ? d.dateDelivrance.format(FR_DATE) : ""),
                    Map.entry("prenom", nn(d.apprenantPrenom)),
                    Map.entry("nom", nn(d.apprenantNom)),
                    Map.entry("formation", nn(d.formationTitre)),
                    Map.entry("dateDebut", nn(d.sessionDebut)),
                    Map.entry("dateFin", nn(d.sessionFin)),
                    Map.entry("salle", nn(d.sessionSalle)),
                    Map.entry("note", d.note != null ? String.format(Locale.FRANCE, "%.1f/20", d.note) : ""),
                    Map.entry("commentaire", nn(d.commentaire)),

                    Map.entry("organismeNom", nn(props.getOrganismeNom())),
                    Map.entry("organismeAdresse", nn(props.getOrganismeAdresse())),
                    Map.entry("organismeVille", nn(props.getOrganismeVille())),
                    Map.entry("organismeEmail", nn(props.getOrganismeEmail())),
                    Map.entry("organismeTelephone", nn(props.getOrganismeTelephone())),
                    Map.entry("organismeSiret", nn(props.getOrganismeSiret())),

                    Map.entry("signataireNom", nn(props.getSignataireNom())),
                    Map.entry("signataireFonction", nn(props.getSignataireFonction()))
            );

            for (var e : fields.entrySet()) {
                try {
                    form.setField(e.getKey(), e.getValue());
                } catch (Exception ignore) {
                    // si un champ n’existe pas dans le template, on ignore
                }
            }

            stamper.setFormFlattening(true);
            stamper.close();
            reader.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur remplissage template PDF: " + e.getMessage(), e);
        }
    }

    private byte[] generateFromScratch(AttestationData d) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 46, 46, 54, 54);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            doc.open();

            // petit cadre discret “officiel”
            PdfContentByte cb = writer.getDirectContent();
            cb.setColorStroke(new Color(210, 210, 210));
            cb.setLineWidth(1f);
            cb.rectangle(36, 36, PageSize.A4.getWidth() - 72, PageSize.A4.getHeight() - 72);
            cb.stroke();

            // Fonts
            Font h1 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font h2 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font p = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 9);
            Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

            // Header: logo + organisme
            PdfPTable header = new PdfPTable(new float[]{1.1f, 2.9f});
            header.setWidthPercentage(100);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Image logo = tryLoadLogo();
            if (logo != null) {
                logo.scaleToFit(110, 60);
                logoCell.addElement(logo);
            } else {
                Paragraph org = new Paragraph(nn(props.getOrganismeNom()), bold);
                logoCell.addElement(org);
            }

            PdfPCell orgCell = new PdfPCell();
            orgCell.setBorder(Rectangle.NO_BORDER);
            orgCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph orgName = new Paragraph(nn(props.getOrganismeNom()), h2);
            Paragraph orgAddr = new Paragraph(buildOrgLine(), small);
            orgAddr.setSpacingBefore(2);

            orgCell.addElement(orgName);
            orgCell.addElement(orgAddr);

            header.addCell(logoCell);
            header.addCell(orgCell);
            doc.add(header);

            doc.add(new Paragraph(" "));
            LineSeparator sep = new LineSeparator();
            sep.setLineWidth(1);
            sep.setLineColor(new Color(200, 200, 200));
            doc.add(sep);
            doc.add(new Paragraph(" "));

            // Title
            Paragraph title = new Paragraph("ATTESTATION DE FORMATION", h1);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            doc.add(new Paragraph(" "));
            Paragraph meta = new Paragraph(
                    "Référence : " + nn(d.reference) + "    •    Délivrée le : " +
                            (d.dateDelivrance != null ? d.dateDelivrance.format(FR_DATE) : ""),
                    p
            );
            meta.setAlignment(Element.ALIGN_CENTER);
            doc.add(meta);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(" "));

            // Body
            Paragraph body1 = new Paragraph();
            body1.setLeading(0, 1.35f);
            body1.add(new Chunk("Nous, ", p));
            body1.add(new Chunk(nn(props.getOrganismeNom()), bold));
            body1.add(new Chunk(", attestons que :", p));
            doc.add(body1);

            doc.add(new Paragraph(" "));

            Paragraph apprenant = new Paragraph(
                    (nn(d.apprenantPrenom) + " " + nn(d.apprenantNom)).trim(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15)
            );
            apprenant.setAlignment(Element.ALIGN_CENTER);
            doc.add(apprenant);

            doc.add(new Paragraph(" "));

            Paragraph body2 = new Paragraph();
            body2.setLeading(0, 1.35f);
            body2.add(new Chunk("a suivi la formation intitulée : ", p));
            body2.add(new Chunk(nn(d.formationTitre), bold));
            doc.add(body2);

            doc.add(new Paragraph(" "));

            PdfPTable info = new PdfPTable(new float[]{1.4f, 2.6f});
            info.setWidthPercentage(100);
            info.setSpacingBefore(6);

            addRow(info, "Période", nn(d.sessionDebut) + "  →  " + nn(d.sessionFin), p, bold);
            if (StringUtils.hasText(d.sessionSalle)) {
                addRow(info, "Lieu", nn(d.sessionSalle), p, bold);
            }
            addRow(info, "Résultat", d.note != null ? String.format(Locale.FRANCE, "%.1f / 20", d.note) : "—", p, bold);
            addRow(info, "Appréciation", StringUtils.hasText(d.commentaire) ? d.commentaire : "—", p, bold);

            doc.add(info);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(" "));

            // Signature block
            PdfPTable sign = new PdfPTable(new float[]{2.2f, 1.8f});
            sign.setWidthPercentage(100);

            PdfPCell left = new PdfPCell();
            left.setBorder(Rectangle.NO_BORDER);
            left.addElement(new Paragraph("Fait pour servir et valoir ce que de droit.", p));

            PdfPCell right = new PdfPCell();
            right.setBorder(Rectangle.NO_BORDER);

            Paragraph signTitle = new Paragraph("Signature", bold);
            right.addElement(signTitle);
            right.addElement(new Paragraph(" ", p));
            right.addElement(new Paragraph(nn(props.getSignataireNom()), bold));
            right.addElement(new Paragraph(nn(props.getSignataireFonction()), p));

            sign.addCell(left);
            sign.addCell(right);

            doc.add(sign);

            doc.add(new Paragraph(" "));
            doc.add(sep);

            Paragraph footer = new Paragraph(
                    nn(props.getOrganismeNom()) + " • " + nn(props.getOrganismeEmail()) + " • " + nn(props.getOrganismeTelephone()),
                    small
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            writer.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF attestation: " + e.getMessage(), e);
        }
    }

    private Image tryLoadLogo() {
        try {
            if (!StringUtils.hasText(props.getLogoPath())) return null;
            Resource res = resourceLoader.getResource(props.getLogoPath());
            if (!res.exists()) return null;
            byte[] bytes = StreamUtils.copyToByteArray(res.getInputStream());
            return Image.getInstance(bytes);
        } catch (Exception e) {
            return null;
        }
    }

    private String buildOrgLine() {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(props.getOrganismeAdresse())) sb.append(props.getOrganismeAdresse());
        if (StringUtils.hasText(props.getOrganismeVille())) {
            if (sb.length() > 0) sb.append(" • ");
            sb.append(props.getOrganismeVille());
        }
        if (StringUtils.hasText(props.getOrganismeEmail())) {
            if (sb.length() > 0) sb.append(" • ");
            sb.append(props.getOrganismeEmail());
        }
        if (StringUtils.hasText(props.getOrganismeTelephone())) {
            if (sb.length() > 0) sb.append(" • ");
            sb.append(props.getOrganismeTelephone());
        }
        if (StringUtils.hasText(props.getOrganismeSiret())) {
            if (sb.length() > 0) sb.append(" • ");
            sb.append("SIRET: ").append(props.getOrganismeSiret());
        }
        return sb.toString();
    }

    private void addRow(PdfPTable t, String label, String value, Font valueFont, Font labelFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        PdfPCell c2 = new PdfPCell(new Phrase(nn(value), valueFont));
        c1.setPadding(10);
        c2.setPadding(10);
        c1.setBorderColor(new Color(220, 220, 220));
        c2.setBorderColor(new Color(220, 220, 220));
        t.addCell(c1);
        t.addCell(c2);
    }

    private String nn(String s) {
        return s == null ? "" : s;
    }
}

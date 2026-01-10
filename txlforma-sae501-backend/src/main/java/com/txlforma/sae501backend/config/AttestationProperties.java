package com.txlforma.sae501backend.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@ConfigurationProperties(prefix = "app.attestation")
@Getter @Setter
public class AttestationProperties {

    /**
     * Infos organisme (dans application.properties)
     */
    private String organismeNom;
    private String organismeAdresse;
    private String organismeVille;
    private String organismeEmail;
    private String organismeTelephone;
    private String organismeSiret;

    /**
     * Signature
     */
    private String signataireNom;
    private String signataireFonction;

    /**
     * Logo (ex: classpath:/attestations/logo.png ou file:uploads/logo.png)
     */
    private String logoPath;

    /**
     * Optionnel : template PDF AcroForm (fields)
     */
    private Template template = new Template();

    @Getter @Setter
    public static class Template {
        private boolean enabled = false;
        private String path; // ex: classpath:/attestations/template.pdf
    }

    @PostConstruct
    public void validate() {
        // on n’empêche pas le run si quelques champs manquent,
        // mais on exige au minimum un nom organisme pour un PDF "officiel".
        if (!StringUtils.hasText(organismeNom)) {
            throw new IllegalStateException("Configuration manquante: app.attestation.organismeNom");
        }
    }
}

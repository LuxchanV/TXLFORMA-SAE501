package com.txlforma.sae501backend.config;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    // ===== ADMIN =====
    @Value("${app.bootstrap.admin.email:admin@txlforma.local}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.nom:Admin}")
    private String adminNom;

    @Value("${app.bootstrap.admin.prenom:TXLForma}")
    private String adminPrenom;

    // ===== FORMATEUR (optionnel) =====
    @Value("${app.bootstrap.formateur.email:}")
    private String formateurEmail;

    @Value("${app.bootstrap.formateur.password:}")
    private String formateurPassword;

    @Value("${app.bootstrap.formateur.nom:Formateur}")
    private String formateurNom;

    @Value("${app.bootstrap.formateur.prenom:Default}")
    private String formateurPrenom;

    @Bean
    public CommandLineRunner seedUsers() {
        return args -> seed();
    }

    @Transactional
    public void seed() {
        seedAdmin();
        seedFormateurIfConfigured();
    }

    private void seedAdmin() {
        if (utilisateurRepository.existsByEmail(adminEmail)) {
            log.info("Bootstrap admin déjà présent: {}", adminEmail);
            return;
        }

        boolean generated = (adminPassword == null || adminPassword.isBlank());
        String rawPassword = generated ? PasswordGenerator.generateDefault() : adminPassword;

        Utilisateur admin = Utilisateur.builder()
                .nom(adminNom)
                .prenom(adminPrenom)
                .email(adminEmail)
                .motDePasse(passwordEncoder.encode(rawPassword))
                .role(Role.ROLE_ADMIN)
                .actif(true)
                .build();

        utilisateurRepository.save(admin);

        if (generated) {
            log.warn("✅ ADMIN créé !");
            log.warn("Email: {}", adminEmail);
            log.warn("Mot de passe (temporaire): {}", rawPassword);
            log.warn("➡️ Change-le dès la 1ère connexion.");
        } else {
            log.info("✅ ADMIN créé avec mot de passe fourni. Email: {}", adminEmail);
        }
    }

    private void seedFormateurIfConfigured() {
        if (formateurEmail == null || formateurEmail.isBlank()) {
            return; // pas configuré => on ne crée pas
        }

        if (utilisateurRepository.existsByEmail(formateurEmail)) {
            log.info("Bootstrap formateur déjà présent: {}", formateurEmail);
            return;
        }

        boolean generated = (formateurPassword == null || formateurPassword.isBlank());
        String rawPassword = generated ? PasswordGenerator.generateDefault() : formateurPassword;

        Utilisateur formateur = Utilisateur.builder()
                .nom(formateurNom)
                .prenom(formateurPrenom)
                .email(formateurEmail)
                .motDePasse(passwordEncoder.encode(rawPassword))
                .role(Role.ROLE_FORMATEUR)
                .actif(true)
                .build();

        utilisateurRepository.save(formateur);

        if (generated) {
            log.warn("✅ FORMATEUR créé !");
            log.warn("Email: {}", formateurEmail);
            log.warn("Mot de passe (temporaire): {}", rawPassword);
        } else {
            log.info("✅ FORMATEUR créé avec mot de passe fourni. Email: {}", formateurEmail);
        }
    }
}

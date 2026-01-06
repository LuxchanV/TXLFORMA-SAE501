package com.txlforma.sae501backend.config;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    @Value("${app.bootstrap.formateur.email:}")
    private String formateurEmail;

    @Value("${app.bootstrap.formateur.password:}")
    private String formateurPassword;

    @Override
    public void run(ApplicationArguments args) {
        createIfMissingAdmin();
        createIfMissingFormateur();
    }

    private void createIfMissingAdmin() {
        String email = safe(adminEmail);
        String password = safe(adminPassword);
        if (email.isBlank() || password.isBlank()) return;

        if (utilisateurRepository.existsByEmail(email)) return;

        Utilisateur admin = Utilisateur.builder()
                .nom("Admin")
                .prenom("System")
                .email(email)
                .motDePasse(passwordEncoder.encode(password))
                .role(Role.ROLE_ADMIN)
                .actif(true)
                .mustChangePassword(true) // ✅ recommandé
                .build();

        utilisateurRepository.save(admin);
    }

    private void createIfMissingFormateur() {
        String email = safe(formateurEmail);
        String password = safe(formateurPassword);
        if (email.isBlank() || password.isBlank()) return;

        if (utilisateurRepository.existsByEmail(email)) return;

        Utilisateur formateur = Utilisateur.builder()
                .nom("Formateur")
                .prenom("Bootstrap")
                .email(email)
                .motDePasse(passwordEncoder.encode(password))
                .role(Role.ROLE_FORMATEUR)
                .actif(true)
                .mustChangePassword(true)
                .build();

        utilisateurRepository.save(formateur);
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }
}

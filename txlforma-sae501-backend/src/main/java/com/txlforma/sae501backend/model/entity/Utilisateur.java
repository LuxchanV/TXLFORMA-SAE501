package com.txlforma.sae501backend.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.txlforma.sae501backend.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur")
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String prenom;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Jamais renvoyé dans les réponses JSON (mais accepté en entrée)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String motDePasse;

    @Column(length = 20)
    private String telephone;

    @Column(length = 255)
    private String adressePostale;

    @Column(length = 150)
    private String entreprise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }
    // ...
    @Builder.Default
    @Column(nullable = false)
    private Boolean actif = true;

}

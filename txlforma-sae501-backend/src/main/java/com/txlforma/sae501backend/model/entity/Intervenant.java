package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "intervenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intervenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_intervenant")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @Column(length = 150)
    private String specialite;

    @Column(length = 20)
    private String statut; // FREELANCE / CDD / VACATAIRE

    private Double tauxHoraire;
}

package com.txlforma.sae501backend.model.entity;

import com.txlforma.sae501backend.model.enums.StatutInscription;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "inscriptions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_inscription_user_session",
                columnNames = {"id_utilisateur", "id_session"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Inscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscription")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_session", nullable = false)
    private SessionFormation session;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime dateInscription = LocalDateTime.now();

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutInscription statut = StatutInscription.EN_ATTENTE_PAIEMENT;
}

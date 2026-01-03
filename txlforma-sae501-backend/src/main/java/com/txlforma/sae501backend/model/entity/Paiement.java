package com.txlforma.sae501backend.model.entity;

import com.txlforma.sae501backend.model.enums.StatutPaiement;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paiement")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inscription", nullable = false)
    private Inscription inscription;

    @Column(nullable = false)
    private Double montant;

    // ✅ Builder.Default
    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime datePaiement = LocalDateTime.now();

    // ✅ Builder.Default
    @Builder.Default
    @Column(nullable = false, length = 50)
    private String modePaiement = "SIMULATION";

    // ✅ Builder.Default
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutPaiement statut = StatutPaiement.SUCCES;

    @Column(length = 255)
    private String referenceExterne;
}

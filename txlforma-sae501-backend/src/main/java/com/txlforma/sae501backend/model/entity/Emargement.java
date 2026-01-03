package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "emargements",
    uniqueConstraints = @UniqueConstraint(name="uq_emargement_inscription_date", columnNames = {"id_inscription","date_jour"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Emargement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_emargement")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inscription", nullable = false)
    private Inscription inscription;

    @Column(name = "date_jour", nullable = false)
    private LocalDate dateJour;

    @Column(nullable = false)
    private boolean present;
}

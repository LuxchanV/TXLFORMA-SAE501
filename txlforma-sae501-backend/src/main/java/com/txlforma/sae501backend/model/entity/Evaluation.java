package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluation")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inscription", nullable = false, unique = true)
    private Inscription inscription;

    @Column(nullable = false)
    private Double note;

    @Column(columnDefinition = "TEXT")
    private String commentaire;
}

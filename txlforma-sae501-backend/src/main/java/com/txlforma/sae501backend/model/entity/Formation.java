package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "formations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formation")
    private Long id;

    @Column(nullable = false, length = 150)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer dureeHeures;

    private Double prix;

    @Column(length = 50)
    private String niveau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie", nullable = false)
    private CategorieFormation categorie;
}

package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories_formation")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CategorieFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie")
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;
}

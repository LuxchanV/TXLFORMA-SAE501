package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "heures_realisees",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_heures_session_date",
                columnNames = {"id_session", "date_jour"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HeuresRealisees {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_heures")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_session", nullable = false)
    private SessionFormation session;

    @Column(name = "date_jour", nullable = false)
    private LocalDate dateJour;

    @Column(nullable = false)
    private Double heures;
}

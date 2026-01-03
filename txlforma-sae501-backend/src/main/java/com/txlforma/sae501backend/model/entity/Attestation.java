package com.txlforma.sae501backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "attestations",
        uniqueConstraints = @UniqueConstraint(name = "uq_attestation_inscription", columnNames = {"id_inscription"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Attestation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_attestation")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inscription", nullable = false)
    private Inscription inscription;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;
}

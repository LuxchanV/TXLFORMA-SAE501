package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Emargement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmargementRepository extends JpaRepository<Emargement, Long> {
    List<Emargement> findByInscription_Id(Long inscriptionId);
    Optional<Emargement> findByInscription_IdAndDateJour(Long inscriptionId, LocalDate dateJour);
}

package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByInscription_Id(Long inscriptionId);
}

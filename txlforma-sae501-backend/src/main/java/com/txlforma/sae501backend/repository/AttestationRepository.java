package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Attestation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttestationRepository extends JpaRepository<Attestation, Long> {
    Optional<Attestation> findByInscription_Id(Long inscriptionId);
    List<Attestation> findByInscription_Session_Id(Long sessionId);
}

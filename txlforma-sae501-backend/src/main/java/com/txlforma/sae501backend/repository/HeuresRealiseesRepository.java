package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.HeuresRealisees;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HeuresRealiseesRepository extends JpaRepository<HeuresRealisees, Long> {

    Optional<HeuresRealisees> findBySession_IdAndDateJour(Long sessionId, LocalDate dateJour);

    List<HeuresRealisees> findBySession_IdOrderByDateJourAsc(Long sessionId);

    @Query("""
        select coalesce(sum(h.heures), 0)
        from HeuresRealisees h
        join h.session s
        join s.intervenant itv
        join itv.utilisateur u
        where u.email = :email
    """)
    Double sumTotalByFormateurEmail(@Param("email") String email);
}

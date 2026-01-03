package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Intervenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IntervenantRepository extends JpaRepository<Intervenant, Long> {

    // ✅ IMPORTANT : propriété correcte = utilisateur.id
    Optional<Intervenant> findByUtilisateur_Id(Long utilisateurId);

    boolean existsByUtilisateur_Id(Long utilisateurId);

    @Query("select i from Intervenant i join fetch i.utilisateur")
    List<Intervenant> findAllWithUtilisateur();
}

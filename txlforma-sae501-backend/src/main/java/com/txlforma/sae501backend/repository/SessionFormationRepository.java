package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.SessionFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface SessionFormationRepository extends JpaRepository<SessionFormation, Long> {

    // anciens (tu peux garder)
    List<SessionFormation> findByFormation_Id(Long formationId);
    boolean existsByFormation_Id(Long formationId);

    // ✅ sessions assignées à l'intervenant connecté
    List<SessionFormation> findByIntervenant_Utilisateur_Email(String email);

    // ✅ vérifier que la session appartient à l'intervenant connecté
    Optional<SessionFormation> findByIdAndIntervenant_Utilisateur_Email(Long id, String email);

    // ✅ NOUVEAU : empêcher retrait rôle FORMATEUR si déjà assigné
    boolean existsByIntervenant_Id(Long intervenantId);



    // ---------------------------
    // ✅ "full fetch"
    // ---------------------------

    @Query("""
        select distinct s from SessionFormation s
        join fetch s.formation f
        left join fetch s.intervenant itv
        left join fetch itv.utilisateur itvu
        order by s.dateDebut desc
    """)
    List<SessionFormation> findAllFull();

    @Query("""
        select distinct s from SessionFormation s
        join fetch s.formation f
        left join fetch s.intervenant itv
        left join fetch itv.utilisateur itvu
        where f.id = :formationId
        order by s.dateDebut desc
    """)
    List<SessionFormation> findByFormationIdFull(@Param("formationId") Long formationId);

    @Query("""
        select s from SessionFormation s
        join fetch s.formation f
        left join fetch s.intervenant itv
        left join fetch itv.utilisateur itvu
        where s.id = :id
    """)
    Optional<SessionFormation> findByIdFull(@Param("id") Long id);
}

package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Inscription;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    boolean existsByUtilisateur_IdAndSession_Id(Long utilisateurId, Long sessionId);

    // ✅ utilisé pour empêcher la suppression d'une session si inscriptions liées
    boolean existsBySession_Id(Long sessionId);

    // ✅ MÉTHODE MANQUANTE (nécessaire au service)
    List<Inscription> findBySession_Id(Long sessionId);

    long countBySession_IdAndStatutIn(Long sessionId, Collection<StatutInscription> statuts);

    @Query("""
       select distinct i from Inscription i
       join fetch i.utilisateur u
       join fetch i.session s
       join fetch s.formation f
       left join fetch s.intervenant itv
       left join fetch itv.utilisateur itu
       where u.id = :utilisateurId
       order by i.dateInscription desc
   """)
    List<Inscription> findAllByUtilisateurIdWithSession(
            @Param("utilisateurId") Long utilisateurId
    );

    @Query("""
       select i from Inscription i
       join fetch i.utilisateur u
       join fetch i.session s
       join fetch s.formation f
       left join fetch s.intervenant itv
       left join fetch itv.utilisateur itu
       where i.id = :id
   """)
    Optional<Inscription> findByIdWithUtilisateur(@Param("id") Long id);

    @Query("""
       select i from Inscription i
       join fetch i.utilisateur u
       where i.session.id = :sessionId
       order by i.dateInscription asc
   """)
    List<Inscription> findBySessionIdWithUtilisateur(
            @Param("sessionId") Long sessionId
    );

    Optional<Inscription> findByIdAndSession_Intervenant_Utilisateur_Email(
            Long id,
            String email
    );

    @Query("""
       select distinct i from Inscription i
       join fetch i.utilisateur u
       join fetch i.session s
       join fetch s.formation f
       left join fetch s.intervenant itv
       left join fetch itv.utilisateur itvu
       where (:statut is null or i.statut = :statut)
         and (:sessionId is null or s.id = :sessionId)
         and (:formationId is null or f.id = :formationId)
         and (:utilisateurId is null or u.id = :utilisateurId)
       order by i.dateInscription desc
   """)
    List<Inscription> searchAdmin(
            @Param("statut") StatutInscription statut,
            @Param("sessionId") Long sessionId,
            @Param("formationId") Long formationId,
            @Param("utilisateurId") Long utilisateurId
    );

    @Query("""
       select i from Inscription i
       join fetch i.utilisateur u
       join fetch i.session s
       join fetch s.formation f
       left join fetch s.intervenant itv
       left join fetch itv.utilisateur itvu
       where i.id = :id
   """)
    Optional<Inscription> findByIdFull(@Param("id") Long id);
}

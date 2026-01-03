package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Paiement;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    List<Paiement> findByStatut(StatutPaiement statut);

    long countByStatut(StatutPaiement statut);

    @Query("select coalesce(sum(p.montant), 0) from Paiement p where p.statut = :statut")
    Double sumMontantByStatut(@Param("statut") StatutPaiement statut);

    List<Paiement> findByInscription_Id(Long inscriptionId);

    @Query("""
        select distinct p from Paiement p
        join fetch p.inscription i
        join fetch i.utilisateur u
        join fetch i.session s
        join fetch s.formation f
        left join fetch s.intervenant itv
        left join fetch itv.utilisateur itvu
        where (:inscriptionId is null or i.id = :inscriptionId)
          and (:utilisateurId is null or u.id = :utilisateurId)
          and (:statut is null or p.statut = :statut)
        order by p.datePaiement desc
    """)
    List<Paiement> searchAdmin(
            @Param("inscriptionId") Long inscriptionId,
            @Param("utilisateurId") Long utilisateurId,
            @Param("statut") StatutPaiement statut
    );

    @Query("""
        select p from Paiement p
        join fetch p.inscription i
        join fetch i.utilisateur u
        join fetch i.session s
        join fetch s.formation f
        left join fetch s.intervenant itv
        left join fetch itv.utilisateur itvu
        where p.id = :id
    """)
    Optional<Paiement> findByIdFull(@Param("id") Long id);
}

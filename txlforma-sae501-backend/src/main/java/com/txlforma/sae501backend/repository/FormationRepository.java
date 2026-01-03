package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    List<Formation> findByCategorie_Id(Long categorieId);

    boolean existsByCategorie_Id(Long categorieId);

    @Query("select f from Formation f join fetch f.categorie")
    List<Formation> findAllWithCategorie();

    @Query("select f from Formation f join fetch f.categorie where f.id = :id")
    Optional<Formation> findByIdWithCategorie(Long id);

    @Query("select f from Formation f join fetch f.categorie where f.categorie.id = :categorieId")
    List<Formation> findByCategorieIdWithCategorie(Long categorieId);
}

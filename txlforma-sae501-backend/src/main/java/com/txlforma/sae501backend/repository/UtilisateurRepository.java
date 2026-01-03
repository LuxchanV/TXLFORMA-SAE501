package com.txlforma.sae501backend.repository;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
       select u from Utilisateur u
       where (:role is null or u.role = :role)
         and (:actif is null or u.actif = :actif)
         and (
            :q is null or :q = '' or
            lower(u.nom) like lower(concat('%', :q, '%')) or
            lower(u.prenom) like lower(concat('%', :q, '%')) or
            lower(u.email) like lower(concat('%', :q, '%'))
         )
       order by u.dateCreation desc
    """)
    List<Utilisateur> searchAdmin(
            @Param("q") String q,
            @Param("role") Role role,
            @Param("actif") Boolean actif
    );
}

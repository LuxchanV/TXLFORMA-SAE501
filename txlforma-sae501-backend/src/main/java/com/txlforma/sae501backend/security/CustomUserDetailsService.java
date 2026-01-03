package com.txlforma.sae501backend.security;

import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utilisateur introuvable")
                );

        // ✅ CHECK utilisateur désactivé
        if (u.getActif() != null && !u.getActif()) {
            throw new DisabledException("Compte désactivé");
        }

        return new org.springframework.security.core.userdetails.User(
                u.getEmail(),
                u.getMotDePasse(),
                List.of(new SimpleGrantedAuthority(u.getRole().name()))
        );
    }
}

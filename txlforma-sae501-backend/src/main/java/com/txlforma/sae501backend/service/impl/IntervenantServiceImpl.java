package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.intervenant.IntervenantCreateDto;
import com.txlforma.sae501backend.dto.intervenant.IntervenantResponseDto;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Intervenant;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.model.enums.Role;
import com.txlforma.sae501backend.repository.IntervenantRepository;
import com.txlforma.sae501backend.repository.UtilisateurRepository;
import com.txlforma.sae501backend.service.IntervenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class IntervenantServiceImpl implements IntervenantService {

    private final IntervenantRepository intervenantRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public IntervenantResponseDto creer(Long utilisateurId, IntervenantCreateDto dto) {

        Utilisateur u = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        if (u.getRole() == Role.ROLE_ADMIN) {
            throw new ConflictException("Un admin ne peut pas être intervenant");
        }

        if (intervenantRepository.existsByUtilisateur_Id(utilisateurId)) {
            throw new ConflictException("Cet utilisateur est déjà intervenant");
        }


        // il devient formateur/intervenant
        u.setRole(Role.ROLE_FORMATEUR);

        Intervenant i = Intervenant.builder()
                .utilisateur(u)
                .specialite(dto.getSpecialite())
                .statut(dto.getStatut())
                .tauxHoraire(dto.getTauxHoraire())
                .build();

        Intervenant saved = intervenantRepository.save(i);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IntervenantResponseDto> lister() {
        return intervenantRepository.findAllWithUtilisateur()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public IntervenantResponseDto update(Long id, IntervenantCreateDto dto) {

        Intervenant i = intervenantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Intervenant introuvable"));

        // Mise à jour des champs
        i.setSpecialite(dto.getSpecialite());
        i.setStatut(dto.getStatut());
        i.setTauxHoraire(dto.getTauxHoraire());

        Intervenant saved = intervenantRepository.save(i);
        return toDto(saved);
    }

    @Override
    public void supprimer(Long id) {
        if (!intervenantRepository.existsById(id)) {
            throw new NotFoundException("Intervenant introuvable");
        }
        intervenantRepository.deleteById(id);
    }

    private IntervenantResponseDto toDto(Intervenant i) {
        Utilisateur u = i.getUtilisateur();

        return IntervenantResponseDto.builder()
                .id(i.getId())
                .utilisateurId(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .role(u.getRole())
                .specialite(i.getSpecialite())
                .statut(i.getStatut())
                .tauxHoraire(i.getTauxHoraire())
                .build();
    }
}

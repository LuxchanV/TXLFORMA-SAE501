package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.intervenant.HeuresEntryDto;
import com.txlforma.sae501backend.dto.intervenant.HeuresSessionDto;
import com.txlforma.sae501backend.dto.intervenant.HeuresSetRequestDto;
import com.txlforma.sae501backend.exception.ForbiddenException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.HeuresRealisees;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.repository.HeuresRealiseesRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.service.HeuresService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HeuresServiceImpl implements HeuresService {

    private final HeuresRealiseesRepository heuresRepo;
    private final SessionFormationRepository sessionRepo;

    @Override
    @Transactional(readOnly = true)
    public HeuresSessionDto getHeuresSession(Long sessionId, String currentEmail) {
        SessionFormation s = sessionRepo.findByIdAndIntervenant_Utilisateur_Email(sessionId, currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : session non assignée à cet intervenant"));

        List<HeuresRealisees> entries = heuresRepo.findBySession_IdOrderByDateJourAsc(sessionId);
        double total = entries.stream().mapToDouble(e -> e.getHeures() == null ? 0d : e.getHeures()).sum();

        return HeuresSessionDto.builder()
                .sessionId(sessionId)
                .totalHeures(total)
                .heuresTheoriques(0) // (si tu veux la vraie valeur, on l’adaptera selon ton entity Formation)
                .entries(entries.stream().map(e -> HeuresEntryDto.builder()
                        .dateJour(e.getDateJour())
                        .heures(e.getHeures())
                        .build()
                ).toList())
                .build();
    }

    @Override
    public void setHeures(HeuresSetRequestDto dto, String currentEmail) {
        SessionFormation s = sessionRepo.findByIdAndIntervenant_Utilisateur_Email(dto.getSessionId(), currentEmail)
                .orElseThrow(() -> new ForbiddenException("Accès refusé : session non assignée à cet intervenant"));

        // ✅ règle : session fermée/annulée = plus de modif
        if (isSessionLocked(s)) {
            throw new ForbiddenException("Session clôturée/annulée : modification des heures interdite.");
        }

        if (dto.getDateJour().isBefore(s.getDateDebut()) || dto.getDateJour().isAfter(s.getDateFin())) {
            throw new NotFoundException("La date n'est pas dans la période de la session");
        }

        HeuresRealisees h = heuresRepo.findBySession_IdAndDateJour(dto.getSessionId(), dto.getDateJour())
                .orElseGet(() -> HeuresRealisees.builder()
                        .session(s)
                        .dateJour(dto.getDateJour())
                        .build()
                );

        h.setHeures(dto.getHeures());
        heuresRepo.save(h);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalHeuresFormateur(String currentEmail) {
        return heuresRepo.sumTotalByFormateurEmail(currentEmail);
    }

    private boolean isSessionLocked(SessionFormation s) {
        if (s == null || s.getStatut() == null) return false;
        String st = s.getStatut().name().toUpperCase();
        return st.contains("FERM") || st.contains("ANNUL") || st.contains("CLOT");
    }
}

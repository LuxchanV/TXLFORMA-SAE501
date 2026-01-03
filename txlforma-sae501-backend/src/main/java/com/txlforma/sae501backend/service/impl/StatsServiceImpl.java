package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.dto.stats.StatPointDto;
import com.txlforma.sae501backend.model.entity.Formation;
import com.txlforma.sae501backend.model.enums.StatutInscription;
import com.txlforma.sae501backend.model.enums.StatutPaiement;
import com.txlforma.sae501backend.repository.EvaluationRepository;
import com.txlforma.sae501backend.repository.FormationRepository;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.PaiementRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import com.txlforma.sae501backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsServiceImpl implements StatsService {

    private final FormationRepository formationRepo;
    private final SessionFormationRepository sessionRepo;
    private final InscriptionRepository inscriptionRepo;
    private final PaiementRepository paiementRepo;
    private final EvaluationRepository evaluationRepo;

    @Override
    public List<StatPointDto> effectifsParFormation() {
        List<StatPointDto> out = new ArrayList<>();

        for (Formation f : formationRepo.findAll()) {
            var sessions = sessionRepo.findByFormation_Id(f.getId());

            long total = 0;
            for (var s : sessions) {
                total += inscriptionRepo.countBySession_IdAndStatutIn(
                        s.getId(),
                        List.of(StatutInscription.PAYEE, StatutInscription.EN_ATTENTE_PAIEMENT)
                );
            }

            out.add(new StatPointDto(f.getTitre(), (double) total));
        }

        return out;
    }

    @Override
    public List<StatPointDto> tauxReussiteParFormation() {
        List<StatPointDto> out = new ArrayList<>();

        for (Formation f : formationRepo.findAll()) {
            var sessions = sessionRepo.findByFormation_Id(f.getId());

            long evalCount = 0;
            long success = 0;

            for (var s : sessions) {
                for (var ins : inscriptionRepo.findBySession_Id(s.getId())) {
                    var opt = evaluationRepo.findByInscription_Id(ins.getId());
                    if (opt.isPresent()) {
                        evalCount++;
                        if (opt.get().getNote() != null && opt.get().getNote() > 10.0) {
                            success++;
                        }
                    }
                }
            }

            double rate = (evalCount == 0) ? 0.0 : (100.0 * success / evalCount);
            out.add(new StatPointDto(f.getTitre(), rate));
        }

        return out;
    }

    @Override
    public List<StatPointDto> chiffreAffairesParFormation() {
        Map<Long, Double> sumByFormation = new HashMap<>();

        paiementRepo.findByStatut(StatutPaiement.SUCCES).forEach(p -> {
            Long formationId = p.getInscription().getSession().getFormation().getId();
            sumByFormation.put(formationId, sumByFormation.getOrDefault(formationId, 0.0) + p.getMontant());
        });

        List<StatPointDto> out = new ArrayList<>();
        for (Formation f : formationRepo.findAll()) {
            out.add(new StatPointDto(f.getTitre(), sumByFormation.getOrDefault(f.getId(), 0.0)));
        }

        return out;
    }
}

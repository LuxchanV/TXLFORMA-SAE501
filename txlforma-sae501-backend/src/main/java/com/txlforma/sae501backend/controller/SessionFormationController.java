package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.catalogue.SessionDto;
import com.txlforma.sae501backend.dto.session.AdminSessionCreateDto;
import com.txlforma.sae501backend.dto.session.AdminSessionUpdateDto;
import com.txlforma.sae501backend.dto.session.AssignIntervenantDto;
import com.txlforma.sae501backend.exception.ConflictException;
import com.txlforma.sae501backend.exception.NotFoundException;
import com.txlforma.sae501backend.model.entity.Formation;
import com.txlforma.sae501backend.model.entity.Intervenant;
import com.txlforma.sae501backend.model.entity.SessionFormation;
import com.txlforma.sae501backend.repository.FormationRepository;
import com.txlforma.sae501backend.repository.InscriptionRepository;
import com.txlforma.sae501backend.repository.IntervenantRepository;
import com.txlforma.sae501backend.repository.SessionFormationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/sessions")
@RequiredArgsConstructor
public class SessionFormationController {

    private final SessionFormationRepository sessionRepo;
    private final FormationRepository formationRepo;
    private final IntervenantRepository intervenantRepo;
    private final InscriptionRepository inscriptionRepo;

    @GetMapping
    public List<SessionDto> lister(@RequestParam(required = false) Long formationId) {
        List<SessionFormation> list = (formationId == null)
                ? sessionRepo.findAll()
                : sessionRepo.findByFormation_Id(formationId);

        return list.stream().map(SessionDto::fromEntity).toList();
    }

    @GetMapping("/{id}")
    public SessionDto get(@PathVariable Long id) {
        SessionFormation s = sessionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Session introuvable"));
        return SessionDto.fromEntity(s);
    }

    @PostMapping
    public ResponseEntity<SessionDto> creer(@Valid @RequestBody AdminSessionCreateDto dto) {
        validateDates(dto.getDateDebut(), dto.getDateFin());

        Formation f = formationRepo.findById(dto.getFormationId())
                .orElseThrow(() -> new NotFoundException("Formation introuvable"));

        SessionFormation s = new SessionFormation();
        s.setFormation(f);

        if (dto.getIntervenantId() != null) {
            Intervenant itv = intervenantRepo.findById(dto.getIntervenantId())
                    .orElseThrow(() -> new NotFoundException("Intervenant introuvable"));
            s.setIntervenant(itv);
        } else {
            s.setIntervenant(null);
        }

        s.setDateDebut(dto.getDateDebut());
        s.setDateFin(dto.getDateFin());
        s.setSalle(dto.getSalle());
        s.setNbPlacesMax(dto.getNbPlacesMax());
        s.setStatut(dto.getStatut());

        SessionFormation saved = sessionRepo.save(s);
        return ResponseEntity.status(201).body(SessionDto.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public SessionDto update(@PathVariable Long id, @Valid @RequestBody AdminSessionUpdateDto dto) {
        SessionFormation s = sessionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Session introuvable"));

        if (dto.getFormationId() != null) {
            Formation f = formationRepo.findById(dto.getFormationId())
                    .orElseThrow(() -> new NotFoundException("Formation introuvable"));
            s.setFormation(f);
        }

        if (dto.getIntervenantId() != null) {
            Intervenant itv = intervenantRepo.findById(dto.getIntervenantId())
                    .orElseThrow(() -> new NotFoundException("Intervenant introuvable"));
            s.setIntervenant(itv);
        }

        if (dto.getDateDebut() != null) s.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) s.setDateFin(dto.getDateFin());
        if (dto.getSalle() != null) s.setSalle(dto.getSalle());
        if (dto.getNbPlacesMax() != null) s.setNbPlacesMax(dto.getNbPlacesMax());
        if (dto.getStatut() != null) s.setStatut(dto.getStatut());

        validateDates(s.getDateDebut(), s.getDateFin());

        return SessionDto.fromEntity(sessionRepo.save(s));
    }

    @PutMapping("/{id}/intervenant")
    public SessionDto assignIntervenant(@PathVariable Long id, @RequestBody AssignIntervenantDto dto) {
        SessionFormation s = sessionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Session introuvable"));

        if (dto.getIntervenantId() == null) {
            s.setIntervenant(null);
        } else {
            Intervenant itv = intervenantRepo.findById(dto.getIntervenantId())
                    .orElseThrow(() -> new NotFoundException("Intervenant introuvable"));
            s.setIntervenant(itv);
        }

        return SessionDto.fromEntity(sessionRepo.save(s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        if (!sessionRepo.existsById(id)) throw new NotFoundException("Session introuvable");

        if (inscriptionRepo.existsBySession_Id(id)) {
            throw new ConflictException(
                    "Impossible de supprimer : des inscriptions existent pour cette session. " +
                            "Annulez/refusez les inscriptions ou mettez la session en ANNULEE."
            );
        }

        sessionRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void validateDates(LocalDate debut, LocalDate fin) {
        if (debut != null && fin != null && fin.isBefore(debut)) {
            throw new ConflictException("dateFin doit être après dateDebut");
        }
    }
}

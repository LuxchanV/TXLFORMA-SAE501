package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.model.entity.Emargement;

import java.time.LocalDate;
import java.util.List;

public interface EmargementService {
    Emargement marquerPresence(Long inscriptionId, LocalDate dateJour, boolean present);
    List<Emargement> emargementsParInscription(Long inscriptionId);
}

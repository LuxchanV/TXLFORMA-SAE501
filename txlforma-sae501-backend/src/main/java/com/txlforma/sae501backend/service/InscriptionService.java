package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.model.entity.Inscription;

import java.util.List;

public interface InscriptionService {
    Inscription creerInscription(Long sessionId);
    List<Inscription> mesInscriptions();
    void annulerInscription(Long inscriptionId);
    Inscription getInscriptionForCurrentUserOrAdmin(Long inscriptionId);
}

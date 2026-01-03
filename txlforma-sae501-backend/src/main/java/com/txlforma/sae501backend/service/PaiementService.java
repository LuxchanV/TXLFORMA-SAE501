package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.model.entity.Paiement;

import java.util.List;

public interface PaiementService {
    Paiement simulerPaiement(Long inscriptionId);
    List<Paiement> paiementsParInscription(Long inscriptionId);
}

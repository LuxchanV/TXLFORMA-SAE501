package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.paiement.PaiementConfirmRequestDto;
import com.txlforma.sae501backend.model.entity.Paiement;

import java.util.List;

public interface PaiementService {

    // ✅ nouveau : crée un paiement EN_ATTENTE
    Paiement creerCheckout(Long inscriptionId);

    // ✅ nouveau : confirme un paiement (SUCCES/ECHEC)
    Paiement confirmerCheckout(Long paiementId, PaiementConfirmRequestDto dto);

    // existant
    Paiement simulerPaiement(Long inscriptionId);

    // existant
    List<Paiement> paiementsParInscription(Long inscriptionId);
}

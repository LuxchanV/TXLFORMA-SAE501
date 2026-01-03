package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.model.entity.Evaluation;

public interface EvaluationService {
    Evaluation enregistrerEvaluation(Long inscriptionId, double note, String commentaire);
    Evaluation getEvaluation(Long inscriptionId);
}

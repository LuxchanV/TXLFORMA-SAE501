package com.txlforma.sae501backend.dto.evaluation;

import com.txlforma.sae501backend.model.entity.Evaluation;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EvaluationDto {
    private Long id;
    private Long inscriptionId;
    private Double note;
    private String commentaire;

    public static EvaluationDto fromEntity(Evaluation e) {
        return EvaluationDto.builder()
                .id(e.getId())
                .inscriptionId(e.getInscription() != null ? e.getInscription().getId() : null)
                .note(e.getNote())
                .commentaire(e.getCommentaire())
                .build();
    }
}

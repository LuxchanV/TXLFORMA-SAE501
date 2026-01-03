package com.txlforma.sae501backend.dto.stats;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminStatsResponseDto {
    private List<StatPointDto> effectifsParFormation;
    private List<StatPointDto> tauxReussiteParFormation;
    private List<StatPointDto> caParFormation;
}

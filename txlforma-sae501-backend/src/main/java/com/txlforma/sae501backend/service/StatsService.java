package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.stats.StatPointDto;
import java.util.List;

public interface StatsService {
    List<StatPointDto> effectifsParFormation();
    List<StatPointDto> tauxReussiteParFormation();
    List<StatPointDto> chiffreAffairesParFormation();
}

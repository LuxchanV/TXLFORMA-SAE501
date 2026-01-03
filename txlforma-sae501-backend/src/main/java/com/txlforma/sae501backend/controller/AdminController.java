package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.stats.StatPointDto;
import com.txlforma.sae501backend.dto.stats.AdminStatsResponseDto;
import com.txlforma.sae501backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final StatsService statsService;

    // ✅ NOUVEAU : endpoint global pour ton front
    @GetMapping("/stats")
    public AdminStatsResponseDto statsGlobales() {
        return AdminStatsResponseDto.builder()
                .effectifsParFormation(statsService.effectifsParFormation())
                .tauxReussiteParFormation(statsService.tauxReussiteParFormation())
                .caParFormation(statsService.chiffreAffairesParFormation())
                .build();
    }

    // ✅ tu gardes tes endpoints existants (utile si tu veux des graphs séparés)
    @GetMapping("/stats/effectifs-par-formation")
    public List<StatPointDto> effectifs() {
        return statsService.effectifsParFormation();
    }

    @GetMapping("/stats/taux-reussite-par-formation")
    public List<StatPointDto> taux() {
        return statsService.tauxReussiteParFormation();
    }

    @GetMapping("/stats/ca-par-formation")
    public List<StatPointDto> ca() {
        return statsService.chiffreAffairesParFormation();
    }
}

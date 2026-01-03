package com.txlforma.sae501backend.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatPointDto {
    private String label;
    private Double value;
}

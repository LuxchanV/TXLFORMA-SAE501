package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUserActifDto {
    @NotNull
    private Boolean actif;
}

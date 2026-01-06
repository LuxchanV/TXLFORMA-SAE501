package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.NotNull;

public record AdminUserActifDto(
        @NotNull Boolean actif
) {}

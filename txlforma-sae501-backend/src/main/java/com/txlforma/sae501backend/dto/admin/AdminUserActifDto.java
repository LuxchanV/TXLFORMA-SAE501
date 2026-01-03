package com.txlforma.sae501backend.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminUserActifDto {
    @NotNull private Boolean actif;
}

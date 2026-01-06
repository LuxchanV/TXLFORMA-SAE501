package com.txlforma.sae501backend.dto.admin;

import com.txlforma.sae501backend.model.enums.Role;
import jakarta.validation.constraints.NotNull;

public record AdminUserRoleDto(
        @NotNull Role role
) {}

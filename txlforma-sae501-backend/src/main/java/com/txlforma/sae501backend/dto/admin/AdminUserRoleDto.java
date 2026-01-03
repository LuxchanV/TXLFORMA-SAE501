package com.txlforma.sae501backend.dto.admin;

import com.txlforma.sae501backend.model.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminUserRoleDto {
    @NotNull private Role role;
}

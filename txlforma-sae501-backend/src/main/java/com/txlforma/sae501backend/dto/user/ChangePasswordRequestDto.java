package com.txlforma.sae501backend.dto.user;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequestDto(
        @NotBlank String oldPassword,
        @NotBlank String newPassword
) {}

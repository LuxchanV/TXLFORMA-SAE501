package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.user.UserResponseDto;
import com.txlforma.sae501backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    public UserResponseDto me() {
        return UserResponseDto.fromEntity(utilisateurService.getCurrentUserEntity());
    }
}

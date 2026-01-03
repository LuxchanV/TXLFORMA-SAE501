package com.txlforma.sae501backend.controller;

import com.txlforma.sae501backend.dto.auth.*;
import com.txlforma.sae501backend.dto.user.UserResponseDto;
import com.txlforma.sae501backend.model.entity.Utilisateur;
import com.txlforma.sae501backend.service.AuthService;
import com.txlforma.sae501backend.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        Utilisateur u = utilisateurService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(u));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        String token = authService.login(dto.getEmail(), dto.getMotDePasse());
        return ResponseEntity.ok(new LoginResponseDto(token));
    }
}

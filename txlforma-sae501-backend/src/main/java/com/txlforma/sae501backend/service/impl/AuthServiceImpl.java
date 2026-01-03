package com.txlforma.sae501backend.service.impl;

import com.txlforma.sae501backend.security.JwtUtil;
import com.txlforma.sae501backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public String login(String email, String motDePasse) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, motDePasse)
        );
        return jwtUtil.generateToken(auth.getName());
    }
}

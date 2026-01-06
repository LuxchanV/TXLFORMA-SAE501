package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.auth.RegisterRequestDto;
import com.txlforma.sae501backend.model.entity.Utilisateur;

public interface UtilisateurService {
    Utilisateur register(RegisterRequestDto dto);
    Utilisateur getCurrentUserEntity();

    // ✅ changer le mdp du user connecté
    void changeMyPassword(String oldPassword, String newPassword);
}

package com.txlforma.sae501backend.service;

import com.txlforma.sae501backend.dto.admin.*;
import com.txlforma.sae501backend.model.enums.Role;

import java.util.List;

public interface AdminUtilisateurService {
    List<AdminUserResponseDto> lister(String q, Role role, Boolean actif);
    AdminUserResponseDto get(Long id);
    AdminUserResponseDto update(Long id, AdminUserUpdateDto dto);
    AdminUserResponseDto changerRole(Long id, Role role);
    AdminUserResponseDto changerActif(Long id, Boolean actif);
    void supprimer(Long id);

    // ✅ création d'un utilisateur par l'admin (USER / FORMATEUR / ADMIN)
    AdminCreateUserResponseDto creer(AdminCreateUserRequestDto dto);
}

package com.txlforma.sae501backend.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("Admin123!"));
    }
}

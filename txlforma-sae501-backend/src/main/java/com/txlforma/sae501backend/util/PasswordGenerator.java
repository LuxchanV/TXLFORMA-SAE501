package com.txlforma.sae501backend.util;

import java.security.SecureRandom;
import java.util.List;

public final class PasswordGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private static final String LOWER  = "abcdefghijkmnopqrstuvwxyz";
    private static final String UPPER  = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String DIGIT  = "23456789";
    private static final String SYMBOL = "!@#$%^&*()-_=+[]{};:,.?";

    private static final List<String> GROUPS = List.of(LOWER, UPPER, DIGIT, SYMBOL);

    private PasswordGenerator() {}

    public static String generateDefault() {
        return generate(16);
    }

    public static String generate(int length) {
        if (length < 12) {
            throw new IllegalArgumentException("La longueur du mot de passe doit être >= 12");
        }

        StringBuilder sb = new StringBuilder(length);

        // 1 char min par groupe
        for (String group : GROUPS) {
            sb.append(randomChar(group));
        }

        // complète
        while (sb.length() < length) {
            String group = GROUPS.get(RANDOM.nextInt(GROUPS.size()));
            sb.append(randomChar(group));
        }

        // shuffle
        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = RANDOM.nextInt(i + 1);
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }

        return new String(chars);
    }

    private static char randomChar(String pool) {
        return pool.charAt(RANDOM.nextInt(pool.length()));
    }
}

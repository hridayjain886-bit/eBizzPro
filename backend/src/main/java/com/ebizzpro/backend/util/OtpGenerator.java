package com.ebizzpro.backend.util;

import java.security.SecureRandom;

public final class OtpGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private OtpGenerator() {
    }

    /** Generates a 6-digit numeric OTP, matching the previous Node implementation. */
    public static String generate() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}

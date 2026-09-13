package com.ebizzpro.backend.service;

public interface MailService {
    void sendVerificationEmail(String toEmail, String otp, int ttlMinutes);
    void sendPasswordResetEmail(String toEmail, String otp, int ttlMinutes);
}

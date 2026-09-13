package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.exception.ApiException;
import com.ebizzpro.backend.service.MailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Override
    public void sendVerificationEmail(String toEmail, String otp, int ttlMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Verify your eBizz Pro account");
            helper.setText(
                    "Your verification code is: " + otp + "\n\n"
                            + "This code expires in " + ttlMinutes + " minutes.\n\n"
                            + "If you did not request this, you can ignore this email.",
                    false
            );
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send verification email to {}", toEmail, ex);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send verification email. Check SMTP configuration.");
        }
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String otp, int ttlMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Reset your eBizzPro password");
            helper.setText(
                    "Your password reset code is: " + otp + "\n\n"
                            + "This code expires in " + ttlMinutes + " minutes.\n\n"
                            + "If you did not request this, you can ignore this email.",
                    false
            );
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}", toEmail, ex);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send password reset email. Check SMTP configuration.");
        }
    }
}

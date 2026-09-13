package com.ebizzpro.backend.controller;

import com.ebizzpro.backend.dto.request.BusinessProfileRequest;
import com.ebizzpro.backend.dto.request.ForgotPasswordRequest;
import com.ebizzpro.backend.dto.request.GoogleAuthRequest;
import com.ebizzpro.backend.dto.request.LoginRequest;
import com.ebizzpro.backend.dto.request.RegisterRequest;
import com.ebizzpro.backend.dto.request.ResendOtpRequest;
import com.ebizzpro.backend.dto.request.ResetPasswordRequest;
import com.ebizzpro.backend.dto.request.VerifyEmailRequest;
import com.ebizzpro.backend.dto.request.VerifyResetOtpRequest;
import com.ebizzpro.backend.dto.response.AuthResponse;
import com.ebizzpro.backend.dto.response.MessageResponse;
import com.ebizzpro.backend.dto.response.UserResponse;
import com.ebizzpro.backend.security.CurrentUser;
import com.ebizzpro.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.verifyEmail(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<MessageResponse> verifyResetOtp(@Valid @RequestBody VerifyResetOtpRequest request) {
        return ResponseEntity.ok(authService.verifyResetOtp(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.googleAuth(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(authService.getCurrentUser(currentUser.getUser().getId()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal CurrentUser currentUser,
                                                        @RequestBody BusinessProfileRequest request) {
        return ResponseEntity.ok(authService.updateBusinessProfile(currentUser.getUser().getId(), request));
    }
}

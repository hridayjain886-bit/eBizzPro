package com.ebizzpro.backend.service;

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

import java.util.UUID;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    AuthResponse verifyEmail(VerifyEmailRequest request);
    MessageResponse resendOtp(ResendOtpRequest request);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse verifyResetOtp(VerifyResetOtpRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleAuth(GoogleAuthRequest request);
    UserResponse getCurrentUser(UUID userId);
    UserResponse updateBusinessProfile(UUID userId, BusinessProfileRequest request);
}

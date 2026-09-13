package com.ebizzpro.backend.service.impl;

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
import com.ebizzpro.backend.entity.AuthProvider;
import com.ebizzpro.backend.entity.BusinessProfile;
import com.ebizzpro.backend.entity.PendingUser;
import com.ebizzpro.backend.entity.User;
import com.ebizzpro.backend.exception.ApiException;
import com.ebizzpro.backend.exception.BadRequestException;
import com.ebizzpro.backend.exception.ConflictException;
import com.ebizzpro.backend.exception.ResourceNotFoundException;
import com.ebizzpro.backend.exception.UnauthorizedException;
import com.ebizzpro.backend.mapper.UserMapper;
import com.ebizzpro.backend.repository.PendingUserRepository;
import com.ebizzpro.backend.repository.UserRepository;
import com.ebizzpro.backend.security.JwtService;
import com.ebizzpro.backend.service.AuthService;
import com.ebizzpro.backend.service.MailService;
import com.ebizzpro.backend.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;
    private final UserMapper userMapper;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Value("${app.otp.ttl-minutes}")
    private int otpTtlMinutes;

    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Account already exists. Please login.");
        }

        pendingUserRepository.deleteByEmail(email);

        String otp = OtpGenerator.generate();
        LocalDateTime otpExpires = LocalDateTime.now().plusMinutes(otpTtlMinutes);

        PendingUser pending = PendingUser.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .otp(otp)
                .otpExpires(otpExpires)
                .build();
        pendingUserRepository.save(pending);

        mailService.sendVerificationEmail(email, otp, otpTtlMinutes);

        return new MessageResponse("Verification code sent to email. Please verify to complete registration.");
    }

    @Override
    @Transactional
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        String email = request.getEmail().toLowerCase();
        PendingUser pending = pendingUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration found for this email."));

        if (LocalDateTime.now().isAfter(pending.getOtpExpires())) {
            pendingUserRepository.delete(pending);
            throw new BadRequestException("OTP expired. Please register again.");
        }

        if (!pending.getOtp().equals(request.getOtp().trim())) {
            throw new BadRequestException("Invalid OTP.");
        }

        User user = User.builder()
                .name(pending.getName())
                .email(pending.getEmail())
                .password(pending.getPassword())
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(true)
                .build();
        user = userRepository.save(user);
        pendingUserRepository.delete(pending);

        String token = jwtService.generateToken(user.getId());
        return AuthResponse.builder().token(token).user(userMapper.toResponse(user)).build();
    }

    @Override
    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        String email = request.getEmail().toLowerCase();
        PendingUser pending = pendingUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration found for this email."));

        String otp = OtpGenerator.generate();
        pending.setOtp(otp);
        pending.setOtpExpires(LocalDateTime.now().plusMinutes(otpTtlMinutes));
        pendingUserRepository.save(pending);

        mailService.sendVerificationEmail(email, otp, otpTtlMinutes);

        return new MessageResponse("Verification code resent to email.");
    }

    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for this email."));

        if (user.getPassword() == null) {
            throw new BadRequestException("This account uses Google Sign-In. Use Google login instead.");
        }

        String otp = OtpGenerator.generate();
        LocalDateTime otpExpires = LocalDateTime.now().plusMinutes(otpTtlMinutes);

        PendingUser pending = pendingUserRepository.findByEmail(email)
                .orElseGet(() -> PendingUser.builder()
                        .name(user.getName())
                        .email(email)
                        .password(user.getPassword())
                        .otp(otp)
                        .otpExpires(otpExpires)
                        .build());

        pending.setName(user.getName());
        pending.setEmail(email);
        pending.setPassword(user.getPassword());
        pending.setOtp(otp);
        pending.setOtpExpires(otpExpires);
        pendingUserRepository.save(pending);

        mailService.sendPasswordResetEmail(email, otp, otpTtlMinutes);
        return new MessageResponse("Password reset code sent to your email.");
    }

    @Override
    @Transactional
    public MessageResponse verifyResetOtp(VerifyResetOtpRequest request) {
        String email = request.getEmail().toLowerCase();
        PendingUser pending = pendingUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No password reset request found for this email."));

        if (LocalDateTime.now().isAfter(pending.getOtpExpires())) {
            pendingUserRepository.delete(pending);
            throw new BadRequestException("OTP expired. Please request a new reset code.");
        }

        if (!pending.getOtp().equals(request.getOtp().trim())) {
            throw new BadRequestException("Invalid OTP.");
        }

        return new MessageResponse("OTP verified. You can now set a new password.");
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for this email."));

        PendingUser pending = pendingUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No password reset request found for this email."));

        if (LocalDateTime.now().isAfter(pending.getOtpExpires())) {
            pendingUserRepository.delete(pending);
            throw new BadRequestException("OTP expired. Please request a new reset code.");
        }

        if (!pending.getOtp().equals(request.getOtp().trim())) {
            throw new BadRequestException("Invalid OTP.");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        pendingUserRepository.delete(pending);

        return new MessageResponse("Password updated successfully.");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found. Please register."));

        if (user.getPassword() == null) {
            throw new UnauthorizedException("This account uses Google Sign-In.");
        }

        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Email not verified. Please verify your email before logging in.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Incorrect password.");
        }

        String token = jwtService.generateToken(user.getId());
        return AuthResponse.builder().token(token).user(userMapper.toResponse(user)).build();
    }

    @Override
    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        GoogleProfile profile = googleTokenVerifier.verify(request.getIdToken(), request.getAccessToken());

        if (profile.getEmail() == null || !profile.isEmailVerified()) {
            throw new UnauthorizedException("Google email is not verified.");
        }

        String email = profile.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            if (user.getName() == null || user.getName().isBlank()) {
                user.setName(profile.getName());
            }
            user.setGoogleId(profile.getGoogleId());
            user.setAvatar(profile.getAvatar());
            if (user.getAuthProvider() == null) {
                user.setAuthProvider(AuthProvider.GOOGLE);
            }
        } else {
            user = User.builder()
                    .name(profile.getName())
                    .email(email)
                    .googleId(profile.getGoogleId())
                    .avatar(profile.getAvatar())
                    .authProvider(AuthProvider.GOOGLE)
                    .emailVerified(true)
                    .build();
        }
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId());
        return AuthResponse.builder().token(token).user(userMapper.toResponse(user)).build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateBusinessProfile(UUID userId, BusinessProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        BusinessProfile profile = new BusinessProfile(
                request.getGstin(),
                request.getBusinessName(),
                request.getTradeName(),
                request.getRegistrationType(),
                request.getState(),
                request.getStateCode(),
                request.getAddress()
        );
        user.setBusinessProfile(profile);
        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }
}

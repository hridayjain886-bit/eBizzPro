package com.ebizzpro.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pending_users")
public class PendingUser extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    /** Already hashed before persisting. */
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String otp;

    @Column(name = "otp_expires", nullable = false)
    private LocalDateTime otpExpires;
}

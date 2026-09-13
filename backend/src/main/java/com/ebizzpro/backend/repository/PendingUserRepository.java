package com.ebizzpro.backend.repository;

import com.ebizzpro.backend.entity.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PendingUserRepository extends JpaRepository<PendingUser, UUID> {
    Optional<PendingUser> findByEmail(String email);
    void deleteByEmail(String email);
}

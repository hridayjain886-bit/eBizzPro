package com.ebizzpro.backend.repository;

import com.ebizzpro.backend.entity.Transporter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransporterRepository extends JpaRepository<Transporter, UUID> {
    List<Transporter> findByUserIdOrderByNameAsc(UUID userId);
    Optional<Transporter> findByIdAndUserId(UUID id, UUID userId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}

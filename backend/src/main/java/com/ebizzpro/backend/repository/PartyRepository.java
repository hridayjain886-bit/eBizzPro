package com.ebizzpro.backend.repository;

import com.ebizzpro.backend.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartyRepository extends JpaRepository<Party, UUID> {
    List<Party> findByUserIdOrderByNameAsc(UUID userId);
    Optional<Party> findByIdAndUserId(UUID id, UUID userId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}

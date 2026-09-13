package com.ebizzpro.backend.repository;

import com.ebizzpro.backend.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockItemRepository extends JpaRepository<StockItem, UUID> {
    List<StockItem> findByUserIdOrderByNameAsc(UUID userId);
    Optional<StockItem> findByIdAndUserId(UUID id, UUID userId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}

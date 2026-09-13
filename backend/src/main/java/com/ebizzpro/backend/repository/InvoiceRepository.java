package com.ebizzpro.backend.repository;

import com.ebizzpro.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Invoice> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByUserIdAndInvoiceNumber(UUID userId, String invoiceNumber);
}

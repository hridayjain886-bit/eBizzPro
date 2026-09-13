package com.ebizzpro.backend.service;

import com.ebizzpro.backend.dto.request.InvoiceRequest;
import com.ebizzpro.backend.dto.request.InvoiceStatusRequest;
import com.ebizzpro.backend.dto.response.InvoiceResponse;

import java.util.List;
import java.util.UUID;

public interface InvoiceService {
    List<InvoiceResponse> listForUser(UUID userId);
    InvoiceResponse create(UUID userId, InvoiceRequest request);
    InvoiceResponse get(UUID userId, UUID invoiceId);
    InvoiceResponse update(UUID userId, UUID invoiceId, InvoiceRequest request);
    InvoiceResponse updateStatus(UUID userId, UUID invoiceId, InvoiceStatusRequest request);
    void delete(UUID userId, UUID invoiceId, boolean restoreStock);
}

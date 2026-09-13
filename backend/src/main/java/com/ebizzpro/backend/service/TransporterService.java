package com.ebizzpro.backend.service;

import com.ebizzpro.backend.dto.request.TransporterRequest;
import com.ebizzpro.backend.dto.response.TransporterResponse;

import java.util.List;
import java.util.UUID;

public interface TransporterService {
    List<TransporterResponse> listForUser(UUID userId);
    TransporterResponse create(UUID userId, TransporterRequest request);
    TransporterResponse get(UUID userId, UUID transporterId);
    TransporterResponse update(UUID userId, UUID transporterId, TransporterRequest request);
    void delete(UUID userId, UUID transporterId);
}

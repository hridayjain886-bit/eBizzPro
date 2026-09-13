package com.ebizzpro.backend.service;

import com.ebizzpro.backend.dto.request.StockItemRequest;
import com.ebizzpro.backend.dto.response.StockItemResponse;

import java.util.List;
import java.util.UUID;

public interface StockService {
    List<StockItemResponse> listForUser(UUID userId);
    StockItemResponse create(UUID userId, StockItemRequest request);
    StockItemResponse get(UUID userId, UUID stockId);
    StockItemResponse update(UUID userId, UUID stockId, StockItemRequest request);
    void delete(UUID userId, UUID stockId);
}

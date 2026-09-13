package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.dto.request.StockItemRequest;
import com.ebizzpro.backend.dto.response.StockItemResponse;
import com.ebizzpro.backend.entity.StockItem;
import com.ebizzpro.backend.entity.User;
import com.ebizzpro.backend.exception.ResourceNotFoundException;
import com.ebizzpro.backend.mapper.StockItemMapper;
import com.ebizzpro.backend.repository.StockItemRepository;
import com.ebizzpro.backend.repository.UserRepository;
import com.ebizzpro.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockItemRepository stockItemRepository;
    private final UserRepository userRepository;
    private final StockItemMapper stockItemMapper;

    @Override
    @Transactional(readOnly = true)
    public List<StockItemResponse> listForUser(UUID userId) {
        return stockItemRepository.findByUserIdOrderByNameAsc(userId).stream()
                .map(stockItemMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public StockItemResponse create(UUID userId, StockItemRequest request) {
        User user = userRepository.getReferenceById(userId);

        StockItem item = StockItem.builder()
                .user(user)
                .name(request.getName())
                .sku(request.getSku())
                .hsn(request.getHsn())
                .quantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ZERO)
                .price(request.getPrice())
                .gstRate(request.getGstRate() != null ? request.getGstRate() : BigDecimal.valueOf(18))
                .gstType(request.getGstType() != null ? request.getGstType() : "IGST")
                .inclusive(Boolean.TRUE.equals(request.getIsInclusive()))
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : BigDecimal.TEN)
                .build();

        return stockItemMapper.toResponse(stockItemRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public StockItemResponse get(UUID userId, UUID stockId) {
        return stockItemMapper.toResponse(findOwned(userId, stockId));
    }

    @Override
    @Transactional
    public StockItemResponse update(UUID userId, UUID stockId, StockItemRequest request) {
        StockItem item = findOwned(userId, stockId);
        stockItemMapper.updateEntity(request, item);
        return stockItemMapper.toResponse(stockItemRepository.save(item));
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID stockId) {
        findOwned(userId, stockId);
        stockItemRepository.deleteByIdAndUserId(stockId, userId);
    }

    private StockItem findOwned(UUID userId, UUID stockId) {
        return stockItemRepository.findByIdAndUserId(stockId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock item not found"));
    }
}

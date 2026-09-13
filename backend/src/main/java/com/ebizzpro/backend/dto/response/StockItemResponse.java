package com.ebizzpro.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockItemResponse {
    private UUID id;
    private String name;
    private String sku;
    private String hsn;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal gstRate;
    private String gstType;
    @JsonProperty("isInclusive")
    private boolean isInclusive;
    private BigDecimal lowStockThreshold;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

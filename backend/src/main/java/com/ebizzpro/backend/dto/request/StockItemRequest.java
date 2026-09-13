package com.ebizzpro.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class StockItemRequest {

    @NotBlank
    private String name;

    private String sku;
    private String hsn;

    @PositiveOrZero
    private BigDecimal quantity;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;

    private BigDecimal gstRate;
    private String gstType;
    private Boolean isInclusive;
    private BigDecimal lowStockThreshold;
}

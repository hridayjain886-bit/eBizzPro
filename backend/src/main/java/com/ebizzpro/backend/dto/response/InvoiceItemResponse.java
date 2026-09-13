package com.ebizzpro.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemResponse {
    private UUID stockId;
    private String name;
    private String hsn;
    private BigDecimal qty;
    private BigDecimal price;
    private BigDecimal gstRate;
    @JsonProperty("isInclusive")
    private boolean isInclusive;
}

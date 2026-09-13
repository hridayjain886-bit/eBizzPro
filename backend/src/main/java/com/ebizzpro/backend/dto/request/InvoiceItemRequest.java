package com.ebizzpro.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class InvoiceItemRequest {

    private UUID stockId;

    @NotBlank
    private String name;

    private String hsn;

    @NotNull
    private BigDecimal qty;

    @NotNull
    private BigDecimal price;

    private BigDecimal gstRate;
    private Boolean isInclusive;
}

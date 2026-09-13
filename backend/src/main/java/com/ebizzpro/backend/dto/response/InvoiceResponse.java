package com.ebizzpro.backend.dto.response;

import com.ebizzpro.backend.entity.InvoiceStatus;
import com.ebizzpro.backend.entity.PartyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private PartyType type;
    private String customerName;
    private String customerGstin;
    private String customerPhone;
    private String customerAddress;
    private String transporterName;
    private String transporterGstin;
    private String transporterPhone;
    private String transporterAddress;
    private String vehicleNumber;
    private List<InvoiceItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal gstAmount;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private BigDecimal igst;
    private boolean isIgst;
    private boolean isInterState;
    private BigDecimal total;
    private BigDecimal roundOffAmount;
    private InvoiceStatus status;
    private String notes;
    private LocalDate date;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

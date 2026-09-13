package com.ebizzpro.backend.dto.request;

import com.ebizzpro.backend.entity.PartyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class InvoiceRequest {

    @NotBlank
    private String invoiceNumber;

    private PartyType type;

    @NotBlank
    private String customerName;

    private String customerGstin;
    private String customerPhone;
    private String customerAddress;

    private String transporterName;
    private String transporterGstin;
    private String transporterPhone;
    private String transporterAddress;
    private String vehicleNumber;

    @NotEmpty
    @Valid
    private List<InvoiceItemRequest> items;

    private Boolean isIgst;
    private Boolean isInterState;
    private String notes;
    private LocalDate date;
}

package com.ebizzpro.backend.dto.request;

import com.ebizzpro.backend.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceStatusRequest {

    @NotNull
    private InvoiceStatus status;
}

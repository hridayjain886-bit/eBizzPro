package com.ebizzpro.backend.mapper;

import com.ebizzpro.backend.dto.response.InvoiceItemResponse;
import com.ebizzpro.backend.dto.response.InvoiceResponse;
import com.ebizzpro.backend.entity.Invoice;
import com.ebizzpro.backend.entity.InvoiceItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

    @Mapping(target = "date", source = "invoiceDate")
    @Mapping(target = "isIgst", source = "igstApplicable")
    @Mapping(target = "isInterState", source = "interState")
    InvoiceResponse toResponse(Invoice invoice);

    @Mapping(target = "stockId", source = "stock.id")
    @Mapping(target = "isInclusive", source = "inclusive")
    InvoiceItemResponse toResponse(InvoiceItem item);
}

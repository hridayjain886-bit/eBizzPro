package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.dto.request.InvoiceItemRequest;
import com.ebizzpro.backend.dto.request.InvoiceRequest;
import com.ebizzpro.backend.dto.request.InvoiceStatusRequest;
import com.ebizzpro.backend.dto.response.InvoiceResponse;
import com.ebizzpro.backend.entity.Invoice;
import com.ebizzpro.backend.entity.InvoiceItem;
import com.ebizzpro.backend.entity.InvoiceStatus;
import com.ebizzpro.backend.entity.PartyType;
import com.ebizzpro.backend.entity.StockItem;
import com.ebizzpro.backend.entity.User;
import com.ebizzpro.backend.exception.ConflictException;
import com.ebizzpro.backend.exception.ResourceNotFoundException;
import com.ebizzpro.backend.mapper.InvoiceMapper;
import com.ebizzpro.backend.repository.InvoiceRepository;
import com.ebizzpro.backend.repository.StockItemRepository;
import com.ebizzpro.backend.repository.UserRepository;
import com.ebizzpro.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final StockItemRepository stockItemRepository;
    private final UserRepository userRepository;
    private final InvoiceMapper invoiceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> listForUser(UUID userId) {
        return invoiceRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public InvoiceResponse create(UUID userId, InvoiceRequest request) {
        if (invoiceRepository.existsByUserIdAndInvoiceNumber(userId, request.getInvoiceNumber())) {
            throw new ConflictException("Invoice number already exists for this user.");
        }

        User user = userRepository.getReferenceById(userId);

        Invoice invoice = Invoice.builder()
                .user(user)
                .invoiceNumber(request.getInvoiceNumber())
                .type(request.getType() != null ? request.getType() : PartyType.B2B)
                .customerName(request.getCustomerName())
                .customerGstin(request.getCustomerGstin())
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getCustomerAddress())
                .transporterName(request.getTransporterName())
                .transporterGstin(request.getTransporterGstin())
                .transporterPhone(request.getTransporterPhone())
                .transporterAddress(request.getTransporterAddress())
                .vehicleNumber(request.getVehicleNumber())
                .igstApplicable(resolveIsIgst(request))
                .interState(Boolean.TRUE.equals(request.getIsInterState()))
                .notes(request.getNotes())
                .invoiceDate(request.getDate() != null ? request.getDate() : LocalDate.now())
                .status(InvoiceStatus.PENDING)
                .build();

        applyItemsAndTotals(invoice, request.getItems());

        Invoice saved = invoiceRepository.save(invoice);
        adjustStockForItems(userId, saved, BigDecimal.valueOf(-1));

        return invoiceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse get(UUID userId, UUID invoiceId) {
        return invoiceMapper.toResponse(findOwned(userId, invoiceId));
    }

    @Override
    @Transactional
    public InvoiceResponse update(UUID userId, UUID invoiceId, InvoiceRequest request) {
        Invoice invoice = findOwned(userId, invoiceId);

        invoice.setInvoiceNumber(request.getInvoiceNumber());
        invoice.setType(request.getType() != null ? request.getType() : invoice.getType());
        invoice.setCustomerName(request.getCustomerName());
        invoice.setCustomerGstin(request.getCustomerGstin());
        invoice.setCustomerPhone(request.getCustomerPhone());
        invoice.setCustomerAddress(request.getCustomerAddress());
        invoice.setTransporterName(request.getTransporterName());
        invoice.setTransporterGstin(request.getTransporterGstin());
        invoice.setTransporterPhone(request.getTransporterPhone());
        invoice.setTransporterAddress(request.getTransporterAddress());
        invoice.setVehicleNumber(request.getVehicleNumber());
        invoice.setIgstApplicable(resolveIsIgst(request));
        invoice.setInterState(Boolean.TRUE.equals(request.getIsInterState()));
        invoice.setNotes(request.getNotes());
        if (request.getDate() != null) {
            invoice.setInvoiceDate(request.getDate());
        }

        if (request.getItems() != null) {
            invoice.getItems().clear();
            applyItemsAndTotals(invoice, request.getItems());
        }

        return invoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceResponse updateStatus(UUID userId, UUID invoiceId, InvoiceStatusRequest request) {
        Invoice invoice = findOwned(userId, invoiceId);
        InvoiceStatus previousStatus = invoice.getStatus();
        InvoiceStatus newStatus = request.getStatus();
        invoice.setStatus(newStatus);
        Invoice saved = invoiceRepository.save(invoice);

        // Cancelling an invoice restocks the items; un-cancelling deducts them again.
        if (previousStatus != InvoiceStatus.CANCELLED && newStatus == InvoiceStatus.CANCELLED) {
            adjustStockForItems(userId, saved, BigDecimal.ONE);
        } else if (previousStatus == InvoiceStatus.CANCELLED && newStatus != InvoiceStatus.CANCELLED) {
            adjustStockForItems(userId, saved, BigDecimal.valueOf(-1));
        }

        return invoiceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID invoiceId, boolean restoreStock) {
        Invoice invoice = findOwned(userId, invoiceId);
        if (restoreStock) {
            adjustStockForItems(userId, invoice, BigDecimal.ONE);
        }
        invoiceRepository.delete(invoice);
    }

    private Invoice findOwned(UUID userId, UUID invoiceId) {
        return invoiceRepository.findByIdAndUserId(invoiceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private boolean resolveIsIgst(InvoiceRequest request) {
        if (request.getIsIgst() != null) {
            return request.getIsIgst();
        }
        return Boolean.TRUE.equals(request.getIsInterState());
    }

    /**
     * Rebuilds the invoice's line items and recalculates GST/subtotal/total the same way the
     * frontend does before submitting - the backend trusts item-level rate/price but derives totals server-side.
     */
    private void applyItemsAndTotals(Invoice invoice, List<InvoiceItemRequest> itemRequests) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal gstAmount = BigDecimal.ZERO;

        for (InvoiceItemRequest itemRequest : itemRequests) {
            StockItem stock = null;
            if (itemRequest.getStockId() != null) {
                stock = stockItemRepository.findByIdAndUserId(itemRequest.getStockId(), invoice.getUser().getId())
                        .orElse(null);
            }

            BigDecimal qty = itemRequest.getQty();
            BigDecimal price = itemRequest.getPrice();
            BigDecimal gstRate = itemRequest.getGstRate() != null ? itemRequest.getGstRate() : BigDecimal.valueOf(18);
            boolean inclusive = Boolean.TRUE.equals(itemRequest.getIsInclusive());

            BigDecimal lineBase = inclusive
                    ? price.multiply(qty).divide(BigDecimal.ONE.add(gstRate.divide(BigDecimal.valueOf(100))), 2, java.math.RoundingMode.HALF_UP)
                    : price.multiply(qty);
            BigDecimal lineGst = lineBase.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

            subtotal = subtotal.add(lineBase);
            gstAmount = gstAmount.add(lineGst);

            InvoiceItem item = InvoiceItem.builder()
                    .stock(stock)
                    .name(itemRequest.getName())
                    .hsn(itemRequest.getHsn())
                    .qty(qty)
                    .price(price)
                    .gstRate(gstRate)
                    .inclusive(inclusive)
                    .build();
            invoice.addItem(item);
        }

        BigDecimal cgst = BigDecimal.ZERO;
        BigDecimal sgst = BigDecimal.ZERO;
        BigDecimal igst = BigDecimal.ZERO;

        if (invoice.isIgstApplicable()) {
            igst = gstAmount;
        } else {
            cgst = gstAmount.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
            sgst = gstAmount.subtract(cgst);
        }

        BigDecimal rawTotal = subtotal.add(gstAmount);
        BigDecimal roundedTotal = rawTotal.setScale(0, java.math.RoundingMode.HALF_UP);
        BigDecimal roundOff = roundedTotal.subtract(rawTotal);

        invoice.setSubtotal(subtotal);
        invoice.setGstAmount(gstAmount);
        invoice.setCgst(cgst);
        invoice.setSgst(sgst);
        invoice.setIgst(igst);
        invoice.setTotal(roundedTotal);
        invoice.setRoundOffAmount(roundOff);
    }

    /**
     * Applies {@code multiplier * item.qty} to each line item's linked stock quantity.
     * Pass -1 to deduct stock (invoice created/un-cancelled), +1 to restock (invoice cancelled).
     */
    private void adjustStockForItems(UUID userId, Invoice invoice, BigDecimal multiplier) {
        for (InvoiceItem item : invoice.getItems()) {
            if (item.getStock() == null) {
                continue;
            }
            stockItemRepository.findByIdAndUserId(item.getStock().getId(), userId).ifPresent(stock -> {
                BigDecimal delta = item.getQty().multiply(multiplier);
                stock.setQuantity(stock.getQuantity().add(delta));
                stockItemRepository.save(stock);
            });
        }
    }
}

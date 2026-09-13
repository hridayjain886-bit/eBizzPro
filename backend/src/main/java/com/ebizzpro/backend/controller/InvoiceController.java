package com.ebizzpro.backend.controller;

import com.ebizzpro.backend.dto.request.InvoiceRequest;
import com.ebizzpro.backend.dto.request.InvoiceStatusRequest;
import com.ebizzpro.backend.dto.response.InvoiceResponse;
import com.ebizzpro.backend.security.CurrentUser;
import com.ebizzpro.backend.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(invoiceService.listForUser(currentUser.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@AuthenticationPrincipal CurrentUser currentUser,
                                                    @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.create(currentUser.getUser().getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> get(@AuthenticationPrincipal CurrentUser currentUser,
                                                 @PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.get(currentUser.getUser().getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InvoiceResponse> update(@AuthenticationPrincipal CurrentUser currentUser,
                                                    @PathVariable UUID id,
                                                    @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.update(currentUser.getUser().getId(), id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(@AuthenticationPrincipal CurrentUser currentUser,
                                                          @PathVariable UUID id,
                                                          @Valid @RequestBody InvoiceStatusRequest request) {
        return ResponseEntity.ok(invoiceService.updateStatus(currentUser.getUser().getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentUser currentUser,
                                        @PathVariable UUID id,
                                        @RequestParam(defaultValue = "false") boolean restoreStock) {
        invoiceService.delete(currentUser.getUser().getId(), id, restoreStock);
        return ResponseEntity.noContent().build();
    }
}

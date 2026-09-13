package com.ebizzpro.backend.controller;

import com.ebizzpro.backend.dto.request.StockItemRequest;
import com.ebizzpro.backend.dto.response.StockItemResponse;
import com.ebizzpro.backend.security.CurrentUser;
import com.ebizzpro.backend.service.StockService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<List<StockItemResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(stockService.listForUser(currentUser.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<StockItemResponse> create(@AuthenticationPrincipal CurrentUser currentUser,
                                                      @Valid @RequestBody StockItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockService.create(currentUser.getUser().getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockItemResponse> get(@AuthenticationPrincipal CurrentUser currentUser,
                                                   @PathVariable UUID id) {
        return ResponseEntity.ok(stockService.get(currentUser.getUser().getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StockItemResponse> update(@AuthenticationPrincipal CurrentUser currentUser,
                                                      @PathVariable UUID id,
                                                      @RequestBody StockItemRequest request) {
        return ResponseEntity.ok(stockService.update(currentUser.getUser().getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentUser currentUser,
                                        @PathVariable UUID id) {
        stockService.delete(currentUser.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }
}

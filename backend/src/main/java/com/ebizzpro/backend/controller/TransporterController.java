package com.ebizzpro.backend.controller;

import com.ebizzpro.backend.dto.request.TransporterRequest;
import com.ebizzpro.backend.dto.response.TransporterResponse;
import com.ebizzpro.backend.security.CurrentUser;
import com.ebizzpro.backend.service.TransporterService;
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
@RequestMapping("/api/transporters")
@RequiredArgsConstructor
public class TransporterController {

    private final TransporterService transporterService;

    @GetMapping
    public ResponseEntity<List<TransporterResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(transporterService.listForUser(currentUser.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<TransporterResponse> create(@AuthenticationPrincipal CurrentUser currentUser,
                                                        @Valid @RequestBody TransporterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transporterService.create(currentUser.getUser().getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransporterResponse> get(@AuthenticationPrincipal CurrentUser currentUser,
                                                     @PathVariable UUID id) {
        return ResponseEntity.ok(transporterService.get(currentUser.getUser().getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TransporterResponse> update(@AuthenticationPrincipal CurrentUser currentUser,
                                                        @PathVariable UUID id,
                                                        @RequestBody TransporterRequest request) {
        return ResponseEntity.ok(transporterService.update(currentUser.getUser().getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentUser currentUser,
                                        @PathVariable UUID id) {
        transporterService.delete(currentUser.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }
}

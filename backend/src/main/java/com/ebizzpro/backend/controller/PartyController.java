package com.ebizzpro.backend.controller;

import com.ebizzpro.backend.dto.request.PartyRequest;
import com.ebizzpro.backend.dto.response.PartyResponse;
import com.ebizzpro.backend.security.CurrentUser;
import com.ebizzpro.backend.service.PartyService;
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
@RequestMapping("/api/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    @GetMapping
    public ResponseEntity<List<PartyResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(partyService.listForUser(currentUser.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<PartyResponse> create(@AuthenticationPrincipal CurrentUser currentUser,
                                                 @Valid @RequestBody PartyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partyService.create(currentUser.getUser().getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartyResponse> get(@AuthenticationPrincipal CurrentUser currentUser,
                                              @PathVariable UUID id) {
        return ResponseEntity.ok(partyService.get(currentUser.getUser().getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PartyResponse> update(@AuthenticationPrincipal CurrentUser currentUser,
                                                 @PathVariable UUID id,
                                                 @RequestBody PartyRequest request) {
        return ResponseEntity.ok(partyService.update(currentUser.getUser().getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentUser currentUser,
                                        @PathVariable UUID id) {
        partyService.delete(currentUser.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }
}

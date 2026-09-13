package com.ebizzpro.backend.controller;

import com.ebizzpro.backend.dto.response.GstinLookupResponse;
import com.ebizzpro.backend.service.GstinLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gstin")
@RequiredArgsConstructor
public class GstinLookupController {
    private final GstinLookupService gstinLookupService;

    @GetMapping("/{gstin}")
    public ResponseEntity<GstinLookupResponse> lookup(@PathVariable String gstin) {
        return ResponseEntity.ok(gstinLookupService.lookup(gstin));
    }
}

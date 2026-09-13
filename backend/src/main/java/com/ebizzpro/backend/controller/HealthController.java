package com.ebizzpro.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "status", "ok",
                "message", "eBizzPro API running",
                "docs", Map.of(
                        "auth", "/api/auth",
                        "invoices", "/api/invoices",
                        "parties", "/api/parties",
                        "transporters", "/api/transporters",
                        "stock", "/api/stock",
                        "gstin", "/api/gstin/{gstin}"
                )
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "healthy", "timestamp", Instant.now().toString());
    }
}

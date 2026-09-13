package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.dto.response.GstinLookupResponse;
import com.ebizzpro.backend.exception.ApiException;
import com.ebizzpro.backend.exception.BadRequestException;
import com.ebizzpro.backend.service.GstinLookupService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GstinLookupServiceImpl implements GstinLookupService {
    private static final Pattern GSTIN = Pattern.compile("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$");

    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    @Value("${app.gstin-check.api-key:}")
    private String apiKey;

    @Value("${app.gstin-check.base-url:https://sheet.gstincheck.co.in/check}")
    private String baseUrl;

    @Override
    public GstinLookupResponse lookup(String value) {
        String gstin = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!GSTIN.matcher(gstin).matches()) {
            throw new BadRequestException("Enter a valid 15-character GSTIN.");
        }
        if (apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "GSTIN lookup is not configured. Add GSTINCHECK_API_KEY on the server.");
        }

        try {
            String body = restClient.get()
                    .uri(baseUrl.replaceAll("/+$", "") + "/{apiKey}/{gstin}", apiKey, gstin)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(body);
            JsonNode data = root.path("data").isObject() ? root.path("data") : root;
            String legalName = text(data, "lgnm", "legalName", "legal_name", "name");
            String tradeName = text(data, "tradeNam", "tradeName", "trade_name");
            if (legalName.isBlank() && tradeName.isBlank()) {
                String providerMessage = text(root, "message", "error");
                throw new ApiException(HttpStatus.NOT_FOUND, providerMessage.isBlank()
                        ? "No GST registration was found for this GSTIN." : providerMessage);
            }
            JsonNode address = data.path("pradr").path("addr");
            String stateCode = gstin.substring(0, 2);
            return GstinLookupResponse.builder()
                    .gstin(gstin)
                    .legalName(legalName)
                    .tradeName(tradeName)
                    .registrationType(text(data, "dty", "registrationType", "registration_type"))
                    .state(text(address, "stcd", "state", "st"))
                    .stateCode(stateCode)
                    .address(joinAddress(address))
                    .build();
        } catch (ApiException exception) {
            throw exception;
        } catch (RestClientException | IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "GSTIN lookup service is unavailable. Please try again.");
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not read the GSTIN lookup response. Please try again.");
        }
    }

    private String text(JsonNode node, String... names) {
        for (String name : names) {
            JsonNode value = node.path(name);
            if (!value.isMissingNode() && !value.isNull() && !value.asText().isBlank()) return value.asText().trim();
        }
        return "";
    }

    private String joinAddress(JsonNode address) {
        List<String> parts = new ArrayList<>();
        for (String field : List.of("bno", "bnm", "flno", "st", "loc", "dst", "pncd")) {
            String value = text(address, field);
            if (!value.isBlank() && !parts.contains(value)) parts.add(value);
        }
        return String.join(", ", parts);
    }
}

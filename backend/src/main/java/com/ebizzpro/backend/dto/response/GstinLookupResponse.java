package com.ebizzpro.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** Normalised business information returned by the configured GSTIN provider. */
@Getter
@Builder
@AllArgsConstructor
public class GstinLookupResponse {
    private final String gstin;
    private final String legalName;
    private final String tradeName;
    private final String registrationType;
    private final String state;
    private final String stateCode;
    private final String address;
}

package com.ebizzpro.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfileResponse {
    private String gstin;
    private String businessName;
    private String tradeName;
    private String registrationType;
    private String state;
    private String stateCode;
    private String address;
}

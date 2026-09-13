package com.ebizzpro.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BusinessProfileRequest {
    private String gstin;
    private String businessName;
    private String tradeName;
    private String registrationType;
    private String state;
    private String stateCode;
    private String address;
}

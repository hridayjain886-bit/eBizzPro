package com.ebizzpro.backend.dto.request;

import com.ebizzpro.backend.entity.PartyType;
import com.ebizzpro.backend.entity.RecordStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartyRequest {

    @NotBlank
    private String name;

    private String gstin;
    private String phone;
    private String email;
    private String address;
    private String stateCode;
    private PartyType type;
    private RecordStatus status;
}

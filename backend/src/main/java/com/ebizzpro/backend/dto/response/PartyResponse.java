package com.ebizzpro.backend.dto.response;

import com.ebizzpro.backend.entity.PartyType;
import com.ebizzpro.backend.entity.RecordStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyResponse {
    private UUID id;
    private String name;
    private String gstin;
    private String phone;
    private String email;
    private String address;
    private String stateCode;
    private PartyType type;
    private RecordStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

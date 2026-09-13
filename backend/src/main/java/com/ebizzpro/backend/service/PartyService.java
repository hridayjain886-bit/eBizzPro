package com.ebizzpro.backend.service;

import com.ebizzpro.backend.dto.request.PartyRequest;
import com.ebizzpro.backend.dto.response.PartyResponse;

import java.util.List;
import java.util.UUID;

public interface PartyService {
    List<PartyResponse> listForUser(UUID userId);
    PartyResponse create(UUID userId, PartyRequest request);
    PartyResponse get(UUID userId, UUID partyId);
    PartyResponse update(UUID userId, UUID partyId, PartyRequest request);
    void delete(UUID userId, UUID partyId);
}

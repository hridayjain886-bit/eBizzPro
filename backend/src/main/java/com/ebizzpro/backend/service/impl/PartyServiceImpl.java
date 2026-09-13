package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.dto.request.PartyRequest;
import com.ebizzpro.backend.dto.response.PartyResponse;
import com.ebizzpro.backend.entity.Party;
import com.ebizzpro.backend.entity.PartyType;
import com.ebizzpro.backend.entity.RecordStatus;
import com.ebizzpro.backend.entity.User;
import com.ebizzpro.backend.exception.ResourceNotFoundException;
import com.ebizzpro.backend.mapper.PartyMapper;
import com.ebizzpro.backend.repository.PartyRepository;
import com.ebizzpro.backend.repository.UserRepository;
import com.ebizzpro.backend.service.PartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartyServiceImpl implements PartyService {

    private final PartyRepository partyRepository;
    private final UserRepository userRepository;
    private final PartyMapper partyMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PartyResponse> listForUser(UUID userId) {
        return partyRepository.findByUserIdOrderByNameAsc(userId).stream()
                .map(partyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PartyResponse create(UUID userId, PartyRequest request) {
        User user = userRepository.getReferenceById(userId);

        Party party = Party.builder()
                .user(user)
                .name(request.getName())
                .gstin(request.getGstin())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .stateCode(request.getStateCode())
                .type(request.getType() != null ? request.getType() : PartyType.B2B)
                .status(request.getStatus() != null ? request.getStatus() : RecordStatus.ACTIVE)
                .build();

        return partyMapper.toResponse(partyRepository.save(party));
    }

    @Override
    @Transactional(readOnly = true)
    public PartyResponse get(UUID userId, UUID partyId) {
        return partyMapper.toResponse(findOwned(userId, partyId));
    }

    @Override
    @Transactional
    public PartyResponse update(UUID userId, UUID partyId, PartyRequest request) {
        Party party = findOwned(userId, partyId);
        partyMapper.updateEntity(request, party);
        return partyMapper.toResponse(partyRepository.save(party));
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID partyId) {
        findOwned(userId, partyId);
        partyRepository.deleteByIdAndUserId(partyId, userId);
    }

    private Party findOwned(UUID userId, UUID partyId) {
        return partyRepository.findByIdAndUserId(partyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found"));
    }
}

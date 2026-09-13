package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.dto.request.TransporterRequest;
import com.ebizzpro.backend.dto.response.TransporterResponse;
import com.ebizzpro.backend.entity.RecordStatus;
import com.ebizzpro.backend.entity.Transporter;
import com.ebizzpro.backend.entity.User;
import com.ebizzpro.backend.exception.ResourceNotFoundException;
import com.ebizzpro.backend.mapper.TransporterMapper;
import com.ebizzpro.backend.repository.TransporterRepository;
import com.ebizzpro.backend.repository.UserRepository;
import com.ebizzpro.backend.service.TransporterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransporterServiceImpl implements TransporterService {

    private final TransporterRepository transporterRepository;
    private final UserRepository userRepository;
    private final TransporterMapper transporterMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TransporterResponse> listForUser(UUID userId) {
        return transporterRepository.findByUserIdOrderByNameAsc(userId).stream()
                .map(transporterMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TransporterResponse create(UUID userId, TransporterRequest request) {
        User user = userRepository.getReferenceById(userId);

        Transporter transporter = Transporter.builder()
                .user(user)
                .name(request.getName())
                .gstin(request.getGstin())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .stateCode(request.getStateCode())
                .vehicleNumber(request.getVehicleNumber())
                .status(request.getStatus() != null ? request.getStatus() : RecordStatus.ACTIVE)
                .build();

        return transporterMapper.toResponse(transporterRepository.save(transporter));
    }

    @Override
    @Transactional(readOnly = true)
    public TransporterResponse get(UUID userId, UUID transporterId) {
        return transporterMapper.toResponse(findOwned(userId, transporterId));
    }

    @Override
    @Transactional
    public TransporterResponse update(UUID userId, UUID transporterId, TransporterRequest request) {
        Transporter transporter = findOwned(userId, transporterId);
        transporterMapper.updateEntity(request, transporter);
        return transporterMapper.toResponse(transporterRepository.save(transporter));
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID transporterId) {
        findOwned(userId, transporterId);
        transporterRepository.deleteByIdAndUserId(transporterId, userId);
    }

    private Transporter findOwned(UUID userId, UUID transporterId) {
        return transporterRepository.findByIdAndUserId(transporterId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transporter not found"));
    }
}

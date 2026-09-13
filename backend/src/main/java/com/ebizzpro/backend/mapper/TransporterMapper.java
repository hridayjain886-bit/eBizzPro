package com.ebizzpro.backend.mapper;

import com.ebizzpro.backend.dto.request.TransporterRequest;
import com.ebizzpro.backend.dto.response.TransporterResponse;
import com.ebizzpro.backend.entity.Transporter;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TransporterMapper {
    TransporterResponse toResponse(Transporter transporter);
    void updateEntity(TransporterRequest request, @MappingTarget Transporter transporter);
}

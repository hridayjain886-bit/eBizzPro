package com.ebizzpro.backend.mapper;

import com.ebizzpro.backend.dto.request.PartyRequest;
import com.ebizzpro.backend.dto.response.PartyResponse;
import com.ebizzpro.backend.entity.Party;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PartyMapper {
    PartyResponse toResponse(Party party);
    void updateEntity(PartyRequest request, @MappingTarget Party party);
}

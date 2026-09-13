package com.ebizzpro.backend.mapper;

import com.ebizzpro.backend.dto.request.StockItemRequest;
import com.ebizzpro.backend.dto.response.StockItemResponse;
import com.ebizzpro.backend.entity.StockItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface StockItemMapper {

    @Mapping(target = "isInclusive", source = "inclusive")
    StockItemResponse toResponse(StockItem stockItem);

    @Mapping(target = "inclusive", source = "isInclusive")
    void updateEntity(StockItemRequest request, @MappingTarget StockItem stockItem);
}

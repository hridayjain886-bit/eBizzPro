package com.ebizzpro.backend.mapper;

import com.ebizzpro.backend.dto.response.BusinessProfileResponse;
import com.ebizzpro.backend.dto.response.UserResponse;
import com.ebizzpro.backend.entity.BusinessProfile;
import com.ebizzpro.backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
    BusinessProfileResponse toResponse(BusinessProfile businessProfile);
}

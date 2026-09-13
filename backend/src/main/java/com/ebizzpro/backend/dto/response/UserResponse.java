package com.ebizzpro.backend.dto.response;

import com.ebizzpro.backend.entity.AuthProvider;
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
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private AuthProvider authProvider;
    private String avatar;
    private BusinessProfileResponse businessProfile;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

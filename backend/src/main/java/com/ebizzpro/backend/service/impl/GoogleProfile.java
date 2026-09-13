package com.ebizzpro.backend.service.impl;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
class GoogleProfile {
    private final String googleId;
    private final String email;
    private final boolean emailVerified;
    private final String name;
    private final String avatar;
}

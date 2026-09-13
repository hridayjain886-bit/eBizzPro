package com.ebizzpro.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequest {

    /** Preferred Google Sign-In flow: a verifiable ID token. */
    private String idToken;

    /** Fallback flow: an OAuth access token. */
    private String accessToken;
}

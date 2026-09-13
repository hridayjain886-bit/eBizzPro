package com.ebizzpro.backend.service.impl;

import com.ebizzpro.backend.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;

/** Verifies Google Sign-In credentials - equivalent of the old verifyGoogleIdentity() helper. */
@Slf4j
@Component
class GoogleTokenVerifier {

    @Value("${app.google.web-client-id}")
    private String googleWebClientId;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    GoogleProfile verify(String idToken, String accessToken) {
        if (googleWebClientId == null || googleWebClientId.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Google Sign-In is not configured on the server.");
        }

        if (idToken != null && !idToken.isBlank()) {
            return verifyIdToken(idToken);
        }

        if (accessToken != null && !accessToken.isBlank()) {
            return verifyAccessToken(accessToken);
        }

        throw new ApiException(HttpStatus.BAD_REQUEST, "Google token is required.");
    }

    private GoogleProfile verifyIdToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleWebClientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token.");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            String name = payload.get("name") != null ? payload.get("name").toString() : null;
            String email = payload.getEmail();
            if (name == null) {
                name = email != null ? email.split("@")[0] : "Google User";
            }
            String avatar = payload.get("picture") != null ? payload.get("picture").toString() : null;

            return new GoogleProfile(payload.getSubject(), email, Boolean.TRUE.equals(payload.getEmailVerified()), name, avatar);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to verify Google ID token", ex);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token.");
        }
    }

    private GoogleProfile verifyAccessToken(String accessToken) {
        try {
            JsonNode tokenInfo = restClient.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?access_token={token}", accessToken)
                    .retrieve()
                    .body(JsonNode.class);

            if (tokenInfo == null || !googleWebClientId.equals(tokenInfo.path("aud").asText())) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google access token.");
            }

            JsonNode profile = restClient.get()
                    .uri("https://openidconnect.googleapis.com/v1/userinfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(JsonNode.class);

            if (profile == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Could not fetch Google profile.");
            }

            String email = profile.path("email").asText(null);
            String name = profile.path("name").asText(email != null ? email.split("@")[0] : "Google User");

            return new GoogleProfile(
                    profile.path("sub").asText(null),
                    email,
                    profile.path("email_verified").asBoolean(false),
                    name,
                    profile.path("picture").asText(null)
            );
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to verify Google access token", ex);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google access token.");
        }
    }
}

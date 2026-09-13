package com.ebizzpro.backend.exception;

import org.springframework.http.HttpStatus;

/** Base class for exceptions that carry a specific HTTP status, mirroring the old error.statusCode pattern. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

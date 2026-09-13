package com.ebizzpro.backend.service;

import com.ebizzpro.backend.dto.response.GstinLookupResponse;

public interface GstinLookupService {
    GstinLookupResponse lookup(String gstin);
}

package com.ebizzpro.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class BusinessProfile {

    @Column(name = "biz_gstin")
    private String gstin;

    @Column(name = "biz_business_name")
    private String businessName;

    @Column(name = "biz_trade_name")
    private String tradeName;

    @Column(name = "biz_registration_type")
    private String registrationType;

    @Column(name = "biz_state")
    private String state;

    @Column(name = "biz_state_code")
    private String stateCode;

    @Column(name = "biz_address")
    private String address;
}

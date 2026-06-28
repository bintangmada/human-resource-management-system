package com.hrms.enterprise.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PayrollDetailResponse {
    private Long id;
    private String itemName;
    private String itemType; // ALLOWANCE, DEDUCTION, TAX, OTHER
    private BigDecimal amount;
}

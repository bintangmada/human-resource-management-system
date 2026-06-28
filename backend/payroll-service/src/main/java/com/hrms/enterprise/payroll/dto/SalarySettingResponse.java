package com.hrms.enterprise.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class SalarySettingResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private BigDecimal baseSalary;
    private BigDecimal allowanceFood;
    private BigDecimal allowanceTransport;
    private BigDecimal allowanceCommunication;
    private Boolean bpjsEnabled;
    private String npwp;
    private String ptkpStatus;
}

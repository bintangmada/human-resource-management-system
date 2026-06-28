package com.hrms.enterprise.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SalarySettingRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;

    private String employeeNumber;

    @NotNull(message = "Base salary is required")
    private BigDecimal baseSalary;

    @NotNull(message = "Food allowance is required")
    private BigDecimal allowanceFood;

    @NotNull(message = "Transport allowance is required")
    private BigDecimal allowanceTransport;

    @NotNull(message = "Communication allowance is required")
    private BigDecimal allowanceCommunication;

    private Boolean bpjsEnabled = true;

    private String npwp;

    private String ptkpStatus = "TK/0";
}

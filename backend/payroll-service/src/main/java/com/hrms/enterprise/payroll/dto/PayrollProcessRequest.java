package com.hrms.enterprise.payroll.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PayrollProcessRequest {

    private Long employeeId; // Optional: if provided, processes only this employee. Otherwise, all employees.

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2020, message = "Year must be at least 2020")
    private Integer year;

    private BigDecimal bonus = BigDecimal.ZERO;

    private BigDecimal lateDeductions = BigDecimal.ZERO;

    private BigDecimal otherDeductions = BigDecimal.ZERO;
}

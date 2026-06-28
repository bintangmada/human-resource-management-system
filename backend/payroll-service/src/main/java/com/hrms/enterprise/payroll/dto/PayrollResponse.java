package com.hrms.enterprise.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private Integer month;
    private Integer year;
    private BigDecimal basicSalary;
    private BigDecimal totalAllowances;
    private BigDecimal totalDeductions;
    private BigDecimal bpjsEmployee;
    private BigDecimal bpjsCompany;
    private BigDecimal taxPPh21;
    private BigDecimal netSalary;
    private String status;
    private String processedBy;
    private LocalDateTime processedAt;
    private List<PayrollDetailResponse> details;
}

package com.hrms.enterprise.offboarding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class OffboardingPayload {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Employee Name is required")
    private String employeeName;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "Resignation date is required")
    private LocalDate resignationDate;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }
}

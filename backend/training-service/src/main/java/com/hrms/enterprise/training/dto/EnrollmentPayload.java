package com.hrms.enterprise.training.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EnrollmentPayload {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Employee Name is required")
    private String employeeName;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
}

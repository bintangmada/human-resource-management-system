package com.hrms.enterprise.travel.dto;

import jakarta.validation.constraints.NotBlank;

public class ProcessExpensePayload {

    @NotBlank(message = "Status is required")
    private String status; // APPROVED, REJECTED

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

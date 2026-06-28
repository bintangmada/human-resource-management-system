package com.hrms.enterprise.offboarding.dto;

import jakarta.validation.constraints.NotBlank;

public class ProcessOffboardingPayload {

    @NotBlank(message = "Status is required")
    private String status; // APPROVED, REJECTED, COMPLETED

    private String adminNotes;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}

package com.hrms.enterprise.asset.dto;

import jakarta.validation.constraints.NotBlank;

public class ProcessRequestPayload {

    @NotBlank(message = "Status is required")
    private String status; // APPROVED, REJECTED

    private String adminNotes;

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
}

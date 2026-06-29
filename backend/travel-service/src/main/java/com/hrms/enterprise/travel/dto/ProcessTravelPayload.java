package com.hrms.enterprise.travel.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ProcessTravelPayload {

    @NotBlank(message = "Status is required")
    private String status; // APPROVED, REJECTED, COMPLETED

    private BigDecimal approvedBudget;

    private String adminNotes;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getApprovedBudget() { return approvedBudget; }
    public void setApprovedBudget(BigDecimal approvedBudget) { this.approvedBudget = approvedBudget; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}

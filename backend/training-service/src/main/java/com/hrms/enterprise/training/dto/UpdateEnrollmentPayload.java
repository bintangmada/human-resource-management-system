package com.hrms.enterprise.training.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateEnrollmentPayload {

    @NotBlank(message = "Status is required")
    private String status; // ENROLLED, COMPLETED, CANCELLED

    private String certificateUrl;

    private String feedback;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}

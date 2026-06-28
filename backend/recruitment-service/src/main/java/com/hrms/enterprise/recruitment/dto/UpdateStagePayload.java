package com.hrms.enterprise.recruitment.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateStagePayload {

    @NotBlank(message = "New recruitment stage is required")
    private String status; // SCREENING, INTERVIEW, OFFERED, HIRED, REJECTED

    private String recruitmentNotes;

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRecruitmentNotes() {
        return recruitmentNotes;
    }

    public void setRecruitmentNotes(String recruitmentNotes) {
        this.recruitmentNotes = recruitmentNotes;
    }
}

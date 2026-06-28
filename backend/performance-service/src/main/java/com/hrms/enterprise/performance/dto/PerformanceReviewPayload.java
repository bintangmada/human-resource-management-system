package com.hrms.enterprise.performance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PerformanceReviewPayload {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Review period is required")
    private String reviewPeriod; // e.g. "Q1 2026", "Annual 2026"

    @NotNull(message = "Job knowledge score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score cannot exceed 5")
    private Integer scoreJobKnowledge;

    @NotNull(message = "Work quality score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score cannot exceed 5")
    private Integer scoreWorkQuality;

    @NotNull(message = "Punctuality score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score cannot exceed 5")
    private Integer scorePunctuality;

    @NotNull(message = "Teamwork score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score cannot exceed 5")
    private Integer scoreTeamwork;

    @NotNull(message = "Communication score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score cannot exceed 5")
    private Integer scoreCommunication;

    private String feedback;

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getReviewPeriod() {
        return reviewPeriod;
    }

    public void setReviewPeriod(String reviewPeriod) {
        this.reviewPeriod = reviewPeriod;
    }

    public Integer getScoreJobKnowledge() {
        return scoreJobKnowledge;
    }

    public void setScoreJobKnowledge(Integer scoreJobKnowledge) {
        this.scoreJobKnowledge = scoreJobKnowledge;
    }

    public Integer getScoreWorkQuality() {
        return scoreWorkQuality;
    }

    public void setScoreWorkQuality(Integer scoreWorkQuality) {
        this.scoreWorkQuality = scoreWorkQuality;
    }

    public Integer getScorePunctuality() {
        return scorePunctuality;
    }

    public void setScorePunctuality(Integer scorePunctuality) {
        this.scorePunctuality = scorePunctuality;
    }

    public Integer getScoreTeamwork() {
        return scoreTeamwork;
    }

    public void setScoreTeamwork(Integer scoreTeamwork) {
        this.scoreTeamwork = scoreTeamwork;
    }

    public Integer getScoreCommunication() {
        return scoreCommunication;
    }

    public void setScoreCommunication(Integer scoreCommunication) {
        this.scoreCommunication = scoreCommunication;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}

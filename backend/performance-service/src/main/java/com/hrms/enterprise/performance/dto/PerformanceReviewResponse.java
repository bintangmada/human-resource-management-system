package com.hrms.enterprise.performance.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PerformanceReviewResponse {
    private Long id;
    private Long tenantId;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private Long reviewerId;
    private String reviewerName;
    private String reviewPeriod;
    private Integer scoreJobKnowledge;
    private Integer scoreWorkQuality;
    private Integer scorePunctuality;
    private Integer scoreTeamwork;
    private Integer scoreCommunication;
    private BigDecimal finalScore;
    private String status;
    private String feedback;
    private LocalDateTime createdAt;
    private String createdBy;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
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

    public BigDecimal getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(BigDecimal finalScore) {
        this.finalScore = finalScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}

package com.hrms.enterprise.performance.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "performance_reviews", schema = "hrms_performance")
public class PerformanceReview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "employee_number")
    private String employeeNumber;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "review_period", nullable = false)
    private String reviewPeriod; // e.g. "Q1 2026", "Annual 2026"

    @Column(name = "score_job_knowledge", nullable = false)
    private Integer scoreJobKnowledge; // 1-5

    @Column(name = "score_work_quality", nullable = false)
    private Integer scoreWorkQuality; // 1-5

    @Column(name = "score_punctuality", nullable = false)
    private Integer scorePunctuality; // 1-5

    @Column(name = "score_teamwork", nullable = false)
    private Integer scoreTeamwork; // 1-5

    @Column(name = "score_communication", nullable = false)
    private Integer scoreCommunication; // 1-5

    @Column(name = "final_score", nullable = false)
    private BigDecimal finalScore;

    @Column(nullable = false)
    private String status; // DRAFT, SUBMITTED, APPROVED

    @Column(length = 2000)
    private String feedback;

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
}

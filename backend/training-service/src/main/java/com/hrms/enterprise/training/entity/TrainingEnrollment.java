package com.hrms.enterprise.training.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "training_enrollments", schema = "hrms_training")
public class TrainingEnrollment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    @JsonIgnore
    private Training training;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "employee_email", nullable = false)
    private String employeeEmail;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    /**
     * ENROLLED, COMPLETED, CANCELLED
     */
    @Column(nullable = false)
    private String status = "ENROLLED";

    @Column(name = "certificate_url")
    private String certificateUrl;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Training getTraining() { return training; }
    public void setTraining(Training training) { this.training = training; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getEmployeeEmail() { return employeeEmail; }
    public void setEmployeeEmail(String employeeEmail) { this.employeeEmail = employeeEmail; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}

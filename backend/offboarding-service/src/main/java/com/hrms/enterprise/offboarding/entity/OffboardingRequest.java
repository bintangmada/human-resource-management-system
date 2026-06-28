package com.hrms.enterprise.offboarding.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offboarding_requests", schema = "hrms_offboarding")
public class OffboardingRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "employee_email", nullable = false)
    private String employeeEmail;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "resignation_date", nullable = false)
    private LocalDate resignationDate;

    /**
     * PENDING, APPROVED, REJECTED, COMPLETED
     */
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @OneToMany(mappedBy = "offboardingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClearanceChecklist> clearanceChecklists = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getEmployeeEmail() { return employeeEmail; }
    public void setEmployeeEmail(String employeeEmail) { this.employeeEmail = employeeEmail; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public List<ClearanceChecklist> getClearanceChecklists() { return clearanceChecklists; }
    public void setClearanceChecklists(List<ClearanceChecklist> clearanceChecklists) { this.clearanceChecklists = clearanceChecklists; }
}

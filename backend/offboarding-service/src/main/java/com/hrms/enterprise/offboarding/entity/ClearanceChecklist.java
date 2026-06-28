package com.hrms.enterprise.offboarding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "clearance_checklists", schema = "hrms_offboarding")
public class ClearanceChecklist extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offboarding_request_id", nullable = false)
    @JsonIgnore
    private OffboardingRequest offboardingRequest;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    /**
     * IT, HR, FINANCE, OFFICE_MANAGER
     */
    @Column(nullable = false)
    private String department;

    /**
     * PENDING, COMPLETED
     */
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "checked_by")
    private String checkedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public OffboardingRequest getOffboardingRequest() { return offboardingRequest; }
    public void setOffboardingRequest(OffboardingRequest offboardingRequest) { this.offboardingRequest = offboardingRequest; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCheckedBy() { return checkedBy; }
    public void setCheckedBy(String checkedBy) { this.checkedBy = checkedBy; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

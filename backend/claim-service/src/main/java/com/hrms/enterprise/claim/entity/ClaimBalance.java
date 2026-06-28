package com.hrms.enterprise.claim.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "claim_balances", schema = "hrms_claim")
public class ClaimBalance extends BaseEntity {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_category_id", nullable = false)
    private ClaimCategory category;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "allocated_amount", nullable = false)
    private BigDecimal allocatedAmount;

    @Column(name = "utilized_amount", nullable = false)
    private BigDecimal utilizedAmount = BigDecimal.ZERO;

    @Column(name = "pending_amount", nullable = false)
    private BigDecimal pendingAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false)
    private BigDecimal remainingAmount;

    @PrePersist
    @PreUpdate
    public void calculateRemaining() {
        if (allocatedAmount == null) allocatedAmount = BigDecimal.ZERO;
        if (utilizedAmount == null) utilizedAmount = BigDecimal.ZERO;
        if (pendingAmount == null) pendingAmount = BigDecimal.ZERO;
        
        // remaining = allocated - utilized - pending
        this.remainingAmount = allocatedAmount.subtract(utilizedAmount).subtract(pendingAmount);
    }

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

    public ClaimCategory getCategory() {
        return category;
    }

    public void setCategory(ClaimCategory category) {
        this.category = category;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getAllocatedAmount() {
        return allocatedAmount;
    }

    public void setAllocatedAmount(BigDecimal allocatedAmount) {
        this.allocatedAmount = allocatedAmount;
    }

    public BigDecimal getUtilizedAmount() {
        return utilizedAmount;
    }

    public void setUtilizedAmount(BigDecimal utilizedAmount) {
        this.utilizedAmount = utilizedAmount;
    }

    public BigDecimal getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(BigDecimal pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }
}

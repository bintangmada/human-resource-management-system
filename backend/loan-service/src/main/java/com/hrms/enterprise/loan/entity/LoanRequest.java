package com.hrms.enterprise.loan.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loan_requests", schema = "hrms_loan")
public class LoanRequest extends BaseEntity {

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

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "interest_rate", nullable = false)
    private BigDecimal interestRate; // e.g. 1.5% as 1.5

    @Column(name = "tenor_months", nullable = false)
    private Integer tenorMonths;

    @Column(name = "monthly_installment", nullable = false)
    private BigDecimal monthlyInstallment;

    private String reason;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, ACTIVE, PAID, CANCELLED

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "rejection_notes")
    private String rejectionNotes;

    @Column(name = "disbursed_date")
    private LocalDate disbursedDate;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoanInstallment> installments = new ArrayList<>();

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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenorMonths() {
        return tenorMonths;
    }

    public void setTenorMonths(Integer tenorMonths) {
        this.tenorMonths = tenorMonths;
    }

    public BigDecimal getMonthlyInstallment() {
        return monthlyInstallment;
    }

    public void setMonthlyInstallment(BigDecimal monthlyInstallment) {
        this.monthlyInstallment = monthlyInstallment;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getRejectionNotes() {
        return rejectionNotes;
    }

    public void setRejectionNotes(String rejectionNotes) {
        this.rejectionNotes = rejectionNotes;
    }

    public LocalDate getDisbursedDate() {
        return disbursedDate;
    }

    public void setDisbursedDate(LocalDate disbursedDate) {
        this.disbursedDate = disbursedDate;
    }

    public List<LoanInstallment> getInstallments() {
        return installments;
    }

    public void setInstallments(List<LoanInstallment> installments) {
        this.installments = installments;
    }
}

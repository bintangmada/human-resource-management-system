package com.hrms.enterprise.loan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_installments", schema = "hrms_loan")
public class LoanInstallment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_request_id", nullable = false)
    @JsonIgnore
    private LoanRequest loan;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(nullable = false)
    private String status; // UNPAID, PAID

    @Column(name = "payroll_deduction_id")
    private Long payrollDeductionId; // Optional link to Payroll when auto-deducted

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LoanRequest getLoan() {
        return loan;
    }

    public void setLoan(LoanRequest loan) {
        this.loan = loan;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getPayrollDeductionId() {
        return payrollDeductionId;
    }

    public void setPayrollDeductionId(Long payrollDeductionId) {
        this.payrollDeductionId = payrollDeductionId;
    }
}

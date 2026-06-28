package com.hrms.enterprise.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payrolls", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "employee_id", "month", "year"})
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Payroll extends BaseEntity {

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

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "basic_salary", nullable = false)
    private BigDecimal basicSalary;

    @Column(name = "total_allowances", nullable = false)
    private BigDecimal totalAllowances;

    @Column(name = "total_deductions", nullable = false)
    private BigDecimal totalDeductions;

    @Column(name = "bpjs_employee", nullable = false)
    private BigDecimal bpjsEmployee;

    @Column(name = "bpjs_company", nullable = false)
    private BigDecimal bpjsCompany;

    @Column(name = "tax_pph21", nullable = false)
    private BigDecimal taxPPh21;

    @Column(name = "net_salary", nullable = false)
    private BigDecimal netSalary;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, APPROVED, PAID

    @Column(name = "processed_by")
    private String processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @OneToMany(mappedBy = "payroll", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollDetail> details = new ArrayList<>();
}

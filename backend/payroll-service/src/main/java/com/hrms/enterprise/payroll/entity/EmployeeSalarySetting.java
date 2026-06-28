package com.hrms.enterprise.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "employee_salary_settings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "employee_id"})
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class EmployeeSalarySetting extends BaseEntity {

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

    @Column(name = "base_salary", nullable = false)
    private BigDecimal baseSalary;

    @Column(name = "allowance_food", nullable = false)
    private BigDecimal allowanceFood;

    @Column(name = "allowance_transport", nullable = false)
    private BigDecimal allowanceTransport;

    @Column(name = "allowance_communication", nullable = false)
    private BigDecimal allowanceCommunication;

    @Column(name = "bpjs_enabled", nullable = false)
    private Boolean bpjsEnabled = true;

    @Column(name = "npwp")
    private String npwp;

    @Column(name = "ptkp_status", nullable = false, length = 10)
    private String ptkpStatus = "TK/0"; // TK/0, TK/1, K/0, etc.
}

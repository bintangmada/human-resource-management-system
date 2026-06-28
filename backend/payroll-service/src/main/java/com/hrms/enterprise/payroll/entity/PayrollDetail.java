package com.hrms.enterprise.payroll.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "payroll_details")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class PayrollDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_id", nullable = false)
    @JsonIgnore
    private Payroll payroll;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType; // ALLOWANCE, DEDUCTION, TAX, OTHER

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
}

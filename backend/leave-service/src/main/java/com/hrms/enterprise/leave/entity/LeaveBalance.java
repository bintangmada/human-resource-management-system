package com.hrms.enterprise.leave.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "leave_balances", indexes = {
        @Index(name = "idx_leave_bal_tenant_emp", columnList = "tenant_id, employee_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "entitlement", nullable = false)
    private Integer entitlement;

    @Builder.Default
    @Column(name = "used", nullable = false)
    private Integer used = 0;

    @Builder.Default
    @Column(name = "pending", nullable = false)
    private Integer pending = 0;
}

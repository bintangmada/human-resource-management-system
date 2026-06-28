package com.hrms.enterprise.leave.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "leave_types", indexes = {
        @Index(name = "idx_leave_type_tenant", columnList = "tenant_id")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveType extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "default_entitlement", nullable = false)
    private Integer defaultEntitlement;

    @Builder.Default
    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval = true;
}

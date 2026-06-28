package com.hrms.enterprise.payroll.repository;

import com.hrms.enterprise.payroll.entity.PayrollDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrollDetailRepository extends JpaRepository<PayrollDetail, Long> {
}

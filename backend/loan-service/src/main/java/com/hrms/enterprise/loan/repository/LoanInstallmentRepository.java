package com.hrms.enterprise.loan.repository;

import com.hrms.enterprise.loan.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanInstallmentRepository extends JpaRepository<LoanInstallment, Long> {
    List<LoanInstallment> findByLoanId(Long loanId);
    
    @Query("SELECT i FROM LoanInstallment i WHERE i.loan.tenantId = :tenantId AND i.loan.employeeId = :employeeId AND i.status = 'UNPAID' AND i.dueDate <= :targetDate")
    List<LoanInstallment> findPendingInstallments(
            @Param("tenantId") Long tenantId, 
            @Param("employeeId") Long employeeId, 
            @Param("targetDate") LocalDate targetDate);
            
    Optional<LoanInstallment> findByIdAndLoanTenantId(Long id, Long tenantId);
}

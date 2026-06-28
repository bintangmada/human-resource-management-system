package com.hrms.enterprise.loan.service;

import com.hrms.enterprise.loan.dto.LoanInstallmentResponse;
import com.hrms.enterprise.loan.dto.LoanRequestPayload;
import com.hrms.enterprise.loan.dto.LoanRequestResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface LoanService {
    
    LoanRequestResponse applyLoan(LoanRequestPayload payload, Long tenantId, String actorEmail);
    
    Page<LoanRequestResponse> getLoans(Long tenantId, String status, Long employeeId, int page, int size);
    
    Page<LoanRequestResponse> getMyLoans(Long tenantId, String actorEmail, int page, int size);
    
    LoanRequestResponse approveLoan(Long id, Long tenantId, String actorEmail);
    
    LoanRequestResponse rejectLoan(Long id, String notes, Long tenantId, String actorEmail);
    
    LoanRequestResponse cancelLoan(Long id, Long tenantId, String actorEmail);
    
    List<LoanInstallmentResponse> getPendingRepayments(Long tenantId, Long employeeId, String targetDate);
    
    LoanInstallmentResponse payInstallment(Long installmentId, Long tenantId, Long payrollDeductionId);
}

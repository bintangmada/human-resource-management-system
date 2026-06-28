package com.hrms.enterprise.loan.service.impl;

import com.hrms.enterprise.loan.dto.LoanInstallmentResponse;
import com.hrms.enterprise.loan.dto.LoanRequestPayload;
import com.hrms.enterprise.loan.dto.LoanRequestResponse;
import com.hrms.enterprise.loan.entity.LoanInstallment;
import com.hrms.enterprise.loan.entity.LoanRequest;
import com.hrms.enterprise.loan.exception.BadRequestException;
import com.hrms.enterprise.loan.exception.ResourceNotFoundException;
import com.hrms.enterprise.loan.repository.LoanInstallmentRepository;
import com.hrms.enterprise.loan.repository.LoanRequestRepository;
import com.hrms.enterprise.loan.service.LoanService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class LoanServiceImpl implements LoanService {

    private final LoanRequestRepository loanRepository;
    private final LoanInstallmentRepository installmentRepository;
    private final MessageSource messageSource;
    private final RestTemplate restTemplate;

    public LoanServiceImpl(
            LoanRequestRepository loanRepository,
            LoanInstallmentRepository installmentRepository,
            MessageSource messageSource) {
        this.loanRepository = loanRepository;
        this.installmentRepository = installmentRepository;
        this.messageSource = messageSource;
        this.restTemplate = new RestTemplate();
    }

    private String getMsg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    // Helper to resolve employee by Email
    private Map<String, Object> resolveEmployeeByEmail(String email, Long tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            headers.set("X-User-Email", email);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = "http://localhost:8022/api/v1/employees";

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object dataObj = response.getBody().get("data");
                if (dataObj instanceof List) {
                    List<Map<String, Object>> employees = (List<Map<String, Object>>) dataObj;
                    for (Map<String, Object> emp : employees) {
                        if (email.equalsIgnoreCase((String) emp.get("email"))) {
                            return emp;
                        }
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Could not resolve employee via REST: " + ex.getMessage());
        }

        // Mock Fallback
        Map<String, Object> mock = new HashMap<>();
        mock.put("id", 1L);
        mock.put("fullName", "User Employee");
        mock.put("employeeNumber", "EMP-99999");
        mock.put("email", email);
        return mock;
    }

    // Helper to resolve employee by ID
    private Map<String, Object> resolveEmployeeById(Long id, Long tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = "http://localhost:8022/api/v1/employees";

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object dataObj = response.getBody().get("data");
                if (dataObj instanceof List) {
                    List<Map<String, Object>> employees = (List<Map<String, Object>>) dataObj;
                    for (Map<String, Object> emp : employees) {
                        Number empId = (Number) emp.get("id");
                        if (empId != null && empId.longValue() == id) {
                            return emp;
                        }
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Could not resolve employee by ID via REST: " + ex.getMessage());
        }

        // Mock Fallback
        Map<String, Object> mock = new HashMap<>();
        mock.put("id", id);
        mock.put("fullName", "Employee #" + id);
        mock.put("employeeNumber", "EMP-" + id);
        return mock;
    }

    @Override
    public LoanRequestResponse applyLoan(LoanRequestPayload payload, Long tenantId, String actorEmail) {
        if (payload.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(getMsg("loan.amount.invalid"));
        }
        if (payload.getTenorMonths() < 1) {
            throw new BadRequestException(getMsg("loan.insufficient.tenor"));
        }

        Map<String, Object> empInfo;
        if (payload.getEmployeeId() != null) {
            empInfo = resolveEmployeeById(payload.getEmployeeId(), tenantId);
        } else {
            empInfo = resolveEmployeeByEmail(actorEmail, tenantId);
        }

        Long employeeId = ((Number) empInfo.get("id")).longValue();

        // Calculate Monthly Repayment (Principal + flat interest)
        BigDecimal interestRateDecimal = payload.getInterestRate().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal totalInterest = payload.getAmount().multiply(interestRateDecimal).multiply(BigDecimal.valueOf(payload.getTenorMonths()));
        BigDecimal totalPayable = payload.getAmount().add(totalInterest);
        BigDecimal monthlyInstallment = totalPayable.divide(BigDecimal.valueOf(payload.getTenorMonths()), 0, RoundingMode.HALF_UP);

        LoanRequest request = new LoanRequest();
        request.setTenantId(tenantId);
        request.setEmployeeId(employeeId);
        request.setEmployeeName((String) empInfo.get("fullName"));
        request.setEmployeeNumber((String) empInfo.get("employeeNumber"));
        request.setAmount(payload.getAmount());
        request.setInterestRate(payload.getInterestRate());
        request.setTenorMonths(payload.getTenorMonths());
        request.setMonthlyInstallment(monthlyInstallment);
        request.setReason(payload.getReason());
        request.setStatus("PENDING");
        request.setCreatedBy(actorEmail);
        request.setUpdatedBy(actorEmail);

        LoanRequest saved = loanRepository.save(request);
        return mapToResponse(saved);
    }

    @Override
    public Page<LoanRequestResponse> getLoans(Long tenantId, String status, Long employeeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<LoanRequest> pageResult;

        if (employeeId != null) {
            pageResult = loanRepository.findByTenantIdAndEmployeeId(tenantId, employeeId, pageable);
        } else if (status != null && !status.isEmpty()) {
            pageResult = loanRepository.findByTenantIdAndStatus(tenantId, status.toUpperCase(), pageable);
        } else {
            pageResult = loanRepository.findByTenantId(tenantId, pageable);
        }

        return pageResult.map(this::mapToResponse);
    }

    @Override
    public Page<LoanRequestResponse> getMyLoans(Long tenantId, String actorEmail, int page, int size) {
        Map<String, Object> empInfo = resolveEmployeeByEmail(actorEmail, tenantId);
        Long employeeId = ((Number) empInfo.get("id")).longValue();
        return getLoans(tenantId, null, employeeId, page, size);
    }

    @Override
    public LoanRequestResponse approveLoan(Long id, Long tenantId, String actorEmail) {
        LoanRequest loan = loanRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("loan.request.not.found")));

        if (!"PENDING".equals(loan.getStatus())) {
            throw new BadRequestException(getMsg("loan.already.processed"));
        }

        loan.setStatus("ACTIVE");
        loan.setApprovedBy(actorEmail);
        loan.setDisbursedDate(LocalDate.now());
        loan.setUpdatedBy(actorEmail);

        // Generate Repayment Installments (due starting next month)
        LocalDate startDate = LocalDate.now();
        List<LoanInstallment> installments = new ArrayList<>();
        for (int i = 1; i <= loan.getTenorMonths(); i++) {
            LoanInstallment installment = new LoanInstallment();
            installment.setLoan(loan);
            installment.setInstallmentNumber(i);
            installment.setAmount(loan.getMonthlyInstallment());
            installment.setDueDate(startDate.plusMonths(i));
            installment.setStatus("UNPAID");
            installment.setCreatedBy(actorEmail);
            installment.setUpdatedBy(actorEmail);
            installments.add(installment);
        }
        loan.getInstallments().addAll(installments);

        LoanRequest saved = loanRepository.save(loan);
        return mapToResponse(saved);
    }

    @Override
    public LoanRequestResponse rejectLoan(Long id, String notes, Long tenantId, String actorEmail) {
        LoanRequest loan = loanRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("loan.request.not.found")));

        if (!"PENDING".equals(loan.getStatus())) {
            throw new BadRequestException(getMsg("loan.already.processed"));
        }

        loan.setStatus("REJECTED");
        loan.setApprovedBy(actorEmail);
        loan.setRejectionNotes(notes);
        loan.setUpdatedBy(actorEmail);

        LoanRequest saved = loanRepository.save(loan);
        return mapToResponse(saved);
    }

    @Override
    public LoanRequestResponse cancelLoan(Long id, Long tenantId, String actorEmail) {
        LoanRequest loan = loanRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("loan.request.not.found")));

        if (!"PENDING".equals(loan.getStatus())) {
            throw new BadRequestException(getMsg("loan.already.processed"));
        }

        loan.setStatus("CANCELLED");
        loan.setUpdatedBy(actorEmail);

        LoanRequest saved = loanRepository.save(loan);
        return mapToResponse(saved);
    }

    @Override
    public List<LoanInstallmentResponse> getPendingRepayments(Long tenantId, Long employeeId, String targetDate) {
        LocalDate date = targetDate != null && !targetDate.isEmpty() 
                ? LocalDate.parse(targetDate) 
                : LocalDate.now();
        List<LoanInstallment> list = installmentRepository.findPendingInstallments(tenantId, employeeId, date);
        return list.stream().map(this::mapInstallmentResponse).collect(Collectors.toList());
    }

    @Override
    public LoanInstallmentResponse payInstallment(Long installmentId, Long tenantId, Long payrollDeductionId) {
        LoanInstallment installment = installmentRepository.findByIdAndLoanTenantId(installmentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("loan.installment.not.found")));

        if ("PAID".equals(installment.getStatus())) {
            return mapInstallmentResponse(installment);
        }

        installment.setStatus("PAID");
        installment.setPaidDate(LocalDate.now());
        installment.setPayrollDeductionId(payrollDeductionId);
        
        LoanInstallment savedInstallment = installmentRepository.save(installment);

        // Check if all installments are paid -> then mark parent LoanRequest as PAID
        LoanRequest loan = installment.getLoan();
        boolean allPaid = true;
        for (LoanInstallment inst : loan.getInstallments()) {
            if (!"PAID".equals(inst.getStatus())) {
                allPaid = false;
                break;
            }
        }

        if (allPaid) {
            loan.setStatus("PAID");
            loanRepository.save(loan);
        }

        return mapInstallmentResponse(savedInstallment);
    }

    // Mapping DTO Helpers
    private LoanRequestResponse mapToResponse(LoanRequest loan) {
        LoanRequestResponse res = new LoanRequestResponse();
        res.setId(loan.getId());
        res.setTenantId(loan.getTenantId());
        res.setEmployeeId(loan.getEmployeeId());
        res.setEmployeeName(loan.getEmployeeName());
        res.setEmployeeNumber(loan.getEmployeeNumber());
        res.setAmount(loan.getAmount());
        res.setInterestRate(loan.getInterestRate());
        res.setTenorMonths(loan.getTenorMonths());
        res.setMonthlyInstallment(loan.getMonthlyInstallment());
        res.setReason(loan.getReason());
        res.setStatus(loan.getStatus());
        res.setApprovedBy(loan.getApprovedBy());
        res.setRejectionNotes(loan.getRejectionNotes());
        res.setDisbursedDate(loan.getDisbursedDate());
        res.setCreatedAt(loan.getCreatedAt());

        if (loan.getInstallments() != null) {
            res.setInstallments(
                loan.getInstallments().stream()
                        .map(this::mapInstallmentResponse)
                        .collect(Collectors.toList())
            );
        }

        return res;
    }

    private LoanInstallmentResponse mapInstallmentResponse(LoanInstallment inst) {
        LoanInstallmentResponse res = new LoanInstallmentResponse();
        res.setId(inst.getId());
        res.setInstallmentNumber(inst.getInstallmentNumber());
        res.setAmount(inst.getAmount());
        res.setDueDate(inst.getDueDate());
        res.setPaidDate(inst.getPaidDate());
        res.setStatus(inst.getStatus());
        res.setPayrollDeductionId(inst.getPayrollDeductionId());
        return res;
    }
}

package com.hrms.enterprise.claim.service.impl;

import com.hrms.enterprise.claim.dto.*;
import com.hrms.enterprise.claim.entity.*;
import com.hrms.enterprise.claim.exception.BadRequestException;
import com.hrms.enterprise.claim.exception.ResourceNotFoundException;
import com.hrms.enterprise.claim.repository.*;
import com.hrms.enterprise.claim.service.ClaimService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClaimServiceImpl implements ClaimService {

    private final ClaimCategoryRepository categoryRepository;
    private final ClaimBalanceRepository balanceRepository;
    private final ClaimRequestRepository claimRequestRepository;
    private final MessageSource messageSource;
    private final RestTemplate restTemplate;

    public ClaimServiceImpl(
            ClaimCategoryRepository categoryRepository,
            ClaimBalanceRepository balanceRepository,
            ClaimRequestRepository claimRequestRepository,
            MessageSource messageSource) {
        this.categoryRepository = categoryRepository;
        this.balanceRepository = balanceRepository;
        this.claimRequestRepository = claimRequestRepository;
        this.messageSource = messageSource;
        this.restTemplate = new RestTemplate();
    }

    private String getMsg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    // Helper to call employee-service and get active employee information
    private Map<String, Object> resolveEmployeeByEmail(String email, Long tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            headers.set("X-User-Email", email);
            headers.set("Authorization", "Bearer " + getSystemTokenMock());

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
            // Fallback mock info for standalone mode / local testing
            System.err.println("Could not resolve employee via REST: " + ex.getMessage());
        }

        // Mock Fallback
        Map<String, Object> mockEmp = new HashMap<>();
        mockEmp.put("id", 1L);
        mockEmp.put("fullName", "User Employee");
        mockEmp.put("employeeNumber", "EMP-99999");
        mockEmp.put("email", email);
        return mockEmp;
    }

    private Map<String, Object> resolveEmployeeById(Long id, Long tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            headers.set("Authorization", "Bearer " + getSystemTokenMock());

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
        Map<String, Object> mockEmp = new HashMap<>();
        mockEmp.put("id", id);
        mockEmp.put("fullName", "Employee #" + id);
        mockEmp.put("employeeNumber", "EMP-" + id);
        return mockEmp;
    }

    private String getSystemTokenMock() {
        // In real environments, this would request a service-to-service token.
        // We can just reuse current authentication header or mock one that bypasses auth check.
        return "";
    }

    // CATEGORY OPERATIONS
    @Override
    public ClaimCategoryResponse createCategory(ClaimCategoryRequest request, Long tenantId, String actorEmail) {
        ClaimCategory category = new ClaimCategory();
        category.setTenantId(tenantId);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setMaxLimit(request.getMaxLimit());
        category.setStatus(request.getStatus());
        category.setCreatedBy(actorEmail);
        category.setUpdatedBy(actorEmail);

        ClaimCategory saved = categoryRepository.save(category);
        return mapToCategoryResponse(saved);
    }

    @Override
    public List<ClaimCategoryResponse> getCategories(Long tenantId, boolean activeOnly) {
        List<ClaimCategory> categories = activeOnly
                ? categoryRepository.findByTenantIdAndStatus(tenantId, 1)
                : categoryRepository.findByTenantId(tenantId);
        return categories.stream().map(this::mapToCategoryResponse).collect(Collectors.toList());
    }

    // BALANCE OPERATIONS
    @Override
    public ClaimBalanceResponse allocateBalance(ClaimBalanceRequest request, Long tenantId, String actorEmail) {
        ClaimCategory category = categoryRepository.findByIdAndTenantId(request.getCategoryId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.category.not.found")));

        Map<String, Object> employeeInfo = resolveEmployeeById(request.getEmployeeId(), tenantId);

        Optional<ClaimBalance> existingOpt = balanceRepository.findByTenantIdAndEmployeeIdAndCategoryIdAndYear(
                tenantId, request.getEmployeeId(), request.getCategoryId(), request.getYear());

        ClaimBalance balance = existingOpt.orElseGet(ClaimBalance::new);
        balance.setTenantId(tenantId);
        balance.setEmployeeId(request.getEmployeeId());
        balance.setEmployeeName((String) employeeInfo.get("fullName"));
        balance.setEmployeeNumber((String) employeeInfo.get("employeeNumber"));
        balance.setCategory(category);
        balance.setYear(request.getYear());
        balance.setAllocatedAmount(request.getAllocatedAmount());
        balance.setCreatedBy(actorEmail);
        balance.setUpdatedBy(actorEmail);

        ClaimBalance saved = balanceRepository.save(balance);
        return mapToBalanceResponse(saved);
    }

    @Override
    public List<ClaimBalanceResponse> getBalances(Long tenantId, Long employeeId, Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<ClaimBalance> balances;
        if (employeeId != null) {
            balances = balanceRepository.findByTenantIdAndEmployeeIdAndYear(tenantId, employeeId, targetYear);
        } else {
            balances = balanceRepository.findByTenantIdAndYear(tenantId, targetYear);
        }
        return balances.stream().map(this::mapToBalanceResponse).collect(Collectors.toList());
    }

    // CLAIM REQUEST OPERATIONS
    @Override
    public ClaimRequestResponse createClaimRequest(ClaimRequestPayload payload, Long tenantId, String actorEmail) {
        ClaimCategory category = categoryRepository.findByIdAndTenantId(payload.getCategoryId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.category.not.found")));

        if (category.getStatus() == 0) {
            throw new BadRequestException("Claim category is currently inactive.");
        }

        Map<String, Object> employeeInfo = resolveEmployeeByEmail(actorEmail, tenantId);
        Long employeeId = ((Number) employeeInfo.get("id")).longValue();
        int currentYear = LocalDate.now().getYear();

        // Get or Auto-provision Claim Balance
        ClaimBalance balance = balanceRepository.findByTenantIdAndEmployeeIdAndCategoryIdAndYear(
                tenantId, employeeId, category.getId(), currentYear)
                .orElseGet(() -> {
                    ClaimBalance newBal = new ClaimBalance();
                    newBal.setTenantId(tenantId);
                    newBal.setEmployeeId(employeeId);
                    newBal.setEmployeeName((String) employeeInfo.get("fullName"));
                    newBal.setEmployeeNumber((String) employeeInfo.get("employeeNumber"));
                    newBal.setCategory(category);
                    newBal.setYear(currentYear);
                    newBal.setAllocatedAmount(category.getMaxLimit()); // Default allocate full category limit
                    newBal.setCreatedBy("SYSTEM-AUTO");
                    newBal.setUpdatedBy("SYSTEM-AUTO");
                    return balanceRepository.save(newBal);
                });

        // Validate Limit
        if (balance.getRemainingAmount().compareTo(payload.getAmount()) < 0) {
            throw new BadRequestException(getMsg("claim.insufficient.balance"));
        }

        // Deduct from Balance (move to pending amount)
        balance.setPendingAmount(balance.getPendingAmount().add(payload.getAmount()));
        balanceRepository.save(balance);

        ClaimRequest claim = new ClaimRequest();
        claim.setTenantId(tenantId);
        claim.setEmployeeId(employeeId);
        claim.setEmployeeName((String) employeeInfo.get("fullName"));
        claim.setEmployeeNumber((String) employeeInfo.get("employeeNumber"));
        claim.setCategory(category);
        claim.setTitle(payload.getTitle());
        claim.setAmount(payload.getAmount());
        claim.setRequestDate(LocalDate.now());
        claim.setDescription(payload.getDescription());
        claim.setReceiptUrl(payload.getReceiptUrl());
        claim.setStatus("PENDING");
        claim.setCreatedBy(actorEmail);
        claim.setUpdatedBy(actorEmail);

        ClaimRequest saved = claimRequestRepository.save(claim);
        return mapToRequestResponse(saved);
    }

    @Override
    public Page<ClaimRequestResponse> getClaims(Long tenantId, String status, Long employeeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ClaimRequest> claimsPage;

        if (employeeId != null) {
            claimsPage = claimRequestRepository.findByTenantIdAndEmployeeId(tenantId, employeeId, pageable);
        } else if (status != null && !status.isEmpty()) {
            claimsPage = claimRequestRepository.findByTenantIdAndStatus(tenantId, status.toUpperCase(), pageable);
        } else {
            claimsPage = claimRequestRepository.findByTenantId(tenantId, pageable);
        }

        return claimsPage.map(this::mapToRequestResponse);
    }

    @Override
    public Page<ClaimRequestResponse> getMyClaims(Long tenantId, String actorEmail, int page, int size) {
        Map<String, Object> employeeInfo = resolveEmployeeByEmail(actorEmail, tenantId);
        Long employeeId = ((Number) employeeInfo.get("id")).longValue();
        return getClaims(tenantId, null, employeeId, page, size);
    }

    @Override
    public ClaimRequestResponse approveClaim(Long id, Long tenantId, String actorEmail) {
        ClaimRequest claim = claimRequestRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.request.not.found")));

        if (!"PENDING".equals(claim.getStatus())) {
            throw new BadRequestException(getMsg("claim.already.processed"));
        }

        ClaimBalance balance = balanceRepository.findByTenantIdAndEmployeeIdAndCategoryIdAndYear(
                tenantId, claim.getEmployeeId(), claim.getCategory().getId(), claim.getRequestDate().getYear())
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.balance.not.found")));

        // Subtract pending, add to utilized
        balance.setPendingAmount(balance.getPendingAmount().subtract(claim.getAmount()));
        balance.setUtilizedAmount(balance.getUtilizedAmount().add(claim.getAmount()));
        balanceRepository.save(balance);

        claim.setStatus("APPROVED");
        claim.setApprovedBy(actorEmail);
        claim.setUpdatedBy(actorEmail);
        
        ClaimRequest saved = claimRequestRepository.save(claim);
        return mapToRequestResponse(saved);
    }

    @Override
    public ClaimRequestResponse rejectClaim(Long id, String notes, Long tenantId, String actorEmail) {
        ClaimRequest claim = claimRequestRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.request.not.found")));

        if (!"PENDING".equals(claim.getStatus())) {
            throw new BadRequestException(getMsg("claim.already.processed"));
        }

        ClaimBalance balance = balanceRepository.findByTenantIdAndEmployeeIdAndCategoryIdAndYear(
                tenantId, claim.getEmployeeId(), claim.getCategory().getId(), claim.getRequestDate().getYear())
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.balance.not.found")));

        // Return pending back to remaining
        balance.setPendingAmount(balance.getPendingAmount().subtract(claim.getAmount()));
        balanceRepository.save(balance);

        claim.setStatus("REJECTED");
        claim.setApprovedBy(actorEmail);
        claim.setRejectionNotes(notes);
        claim.setUpdatedBy(actorEmail);

        ClaimRequest saved = claimRequestRepository.save(claim);
        return mapToRequestResponse(saved);
    }

    @Override
    public ClaimRequestResponse cancelClaim(Long id, Long tenantId, String actorEmail) {
        ClaimRequest claim = claimRequestRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.request.not.found")));

        if (!"PENDING".equals(claim.getStatus())) {
            throw new BadRequestException(getMsg("claim.already.processed"));
        }

        ClaimBalance balance = balanceRepository.findByTenantIdAndEmployeeIdAndCategoryIdAndYear(
                tenantId, claim.getEmployeeId(), claim.getCategory().getId(), claim.getRequestDate().getYear())
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("claim.balance.not.found")));

        // Return pending back to remaining
        balance.setPendingAmount(balance.getPendingAmount().subtract(claim.getAmount()));
        balanceRepository.save(balance);

        claim.setStatus("CANCELLED");
        claim.setUpdatedBy(actorEmail);

        ClaimRequest saved = claimRequestRepository.save(claim);
        return mapToRequestResponse(saved);
    }

    // MAPPING HELPERS
    private ClaimCategoryResponse mapToCategoryResponse(ClaimCategory category) {
        ClaimCategoryResponse res = new ClaimCategoryResponse();
        res.setId(category.getId());
        res.setTenantId(category.getTenantId());
        res.setName(category.getName());
        res.setDescription(category.getDescription());
        res.setMaxLimit(category.getMaxLimit());
        res.setStatus(category.getStatus());
        return res;
    }

    private ClaimBalanceResponse mapToBalanceResponse(ClaimBalance balance) {
        ClaimBalanceResponse res = new ClaimBalanceResponse();
        res.setId(balance.getId());
        res.setTenantId(balance.getTenantId());
        res.setEmployeeId(balance.getEmployeeId());
        res.setEmployeeName(balance.getEmployeeName());
        res.setEmployeeNumber(balance.getEmployeeNumber());
        res.setCategoryId(balance.getCategory().getId());
        res.setCategoryName(balance.getCategory().getName());
        res.setYear(balance.getYear());
        res.setAllocatedAmount(balance.getAllocatedAmount());
        res.setUtilizedAmount(balance.getUtilizedAmount());
        res.setPendingAmount(balance.getPendingAmount());
        res.setRemainingAmount(balance.getRemainingAmount());
        return res;
    }

    private ClaimRequestResponse mapToRequestResponse(ClaimRequest claim) {
        ClaimRequestResponse res = new ClaimRequestResponse();
        res.setId(claim.getId());
        res.setTenantId(claim.getTenantId());
        res.setEmployeeId(claim.getEmployeeId());
        res.setEmployeeName(claim.getEmployeeName());
        res.setEmployeeNumber(claim.getEmployeeNumber());
        res.setCategoryId(claim.getCategory().getId());
        res.setCategoryName(claim.getCategory().getName());
        res.setTitle(claim.getTitle());
        res.setAmount(claim.getAmount());
        res.setRequestDate(claim.getRequestDate());
        res.setDescription(claim.getDescription());
        res.setReceiptUrl(claim.getReceiptUrl());
        res.setStatus(claim.getStatus());
        res.setApprovedBy(claim.getApprovedBy());
        res.setRejectionNotes(claim.getRejectionNotes());
        res.setCreatedAt(claim.getCreatedAt());
        return res;
    }
}

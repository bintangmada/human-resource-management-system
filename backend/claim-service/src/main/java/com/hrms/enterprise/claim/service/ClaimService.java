package com.hrms.enterprise.claim.service;

import com.hrms.enterprise.claim.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ClaimService {
    
    ClaimCategoryResponse createCategory(ClaimCategoryRequest request, Long tenantId, String actorEmail);
    
    List<ClaimCategoryResponse> getCategories(Long tenantId, boolean activeOnly);
    
    ClaimBalanceResponse allocateBalance(ClaimBalanceRequest request, Long tenantId, String actorEmail);
    
    List<ClaimBalanceResponse> getBalances(Long tenantId, Long employeeId, Integer year);
    
    ClaimRequestResponse createClaimRequest(ClaimRequestPayload payload, Long tenantId, String actorEmail);
    
    Page<ClaimRequestResponse> getClaims(Long tenantId, String status, Long employeeId, int page, int size);
    
    Page<ClaimRequestResponse> getMyClaims(Long tenantId, String actorEmail, int page, int size);
    
    ClaimRequestResponse approveClaim(Long id, Long tenantId, String actorEmail);
    
    ClaimRequestResponse rejectClaim(Long id, String notes, Long tenantId, String actorEmail);
    
    ClaimRequestResponse cancelClaim(Long id, Long tenantId, String actorEmail);
}

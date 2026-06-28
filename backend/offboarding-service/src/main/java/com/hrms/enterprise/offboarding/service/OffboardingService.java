package com.hrms.enterprise.offboarding.service;

import com.hrms.enterprise.offboarding.dto.ClearanceChecklistPayload;
import com.hrms.enterprise.offboarding.dto.OffboardingPayload;
import com.hrms.enterprise.offboarding.dto.ProcessOffboardingPayload;
import com.hrms.enterprise.offboarding.entity.ClearanceChecklist;
import com.hrms.enterprise.offboarding.entity.OffboardingRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface OffboardingService {
    OffboardingRequest submitRequest(OffboardingPayload payload, Long tenantId, String employeeEmail);
    Page<OffboardingRequest> getRequests(Long tenantId, int page, int size);
    List<OffboardingRequest> getMyRequests(Long tenantId, String employeeEmail);
    OffboardingRequest processRequest(Long id, ProcessOffboardingPayload payload, Long tenantId, String actorEmail);
    ClearanceChecklist updateClearanceItem(Long requestId, Long itemId, ClearanceChecklistPayload payload, Long tenantId, String actorEmail);
}

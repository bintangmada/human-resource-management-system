package com.hrms.enterprise.offboarding.service.impl;

import com.hrms.enterprise.offboarding.dto.ClearanceChecklistPayload;
import com.hrms.enterprise.offboarding.dto.OffboardingPayload;
import com.hrms.enterprise.offboarding.dto.ProcessOffboardingPayload;
import com.hrms.enterprise.offboarding.entity.ClearanceChecklist;
import com.hrms.enterprise.offboarding.entity.OffboardingRequest;
import com.hrms.enterprise.offboarding.exception.ResourceNotFoundException;
import com.hrms.enterprise.offboarding.repository.ClearanceChecklistRepository;
import com.hrms.enterprise.offboarding.repository.OffboardingRequestRepository;
import com.hrms.enterprise.offboarding.service.OffboardingService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class OffboardingServiceImpl implements OffboardingService {

    private final OffboardingRequestRepository requestRepository;
    private final ClearanceChecklistRepository checklistRepository;
    private final MessageSource messageSource;

    public OffboardingServiceImpl(OffboardingRequestRepository requestRepository,
                                  ClearanceChecklistRepository checklistRepository,
                                  MessageSource messageSource) {
        this.requestRepository = requestRepository;
        this.checklistRepository = checklistRepository;
        this.messageSource = messageSource;
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @Override
    public OffboardingRequest submitRequest(OffboardingPayload payload, Long tenantId, String employeeEmail) {
        OffboardingRequest req = new OffboardingRequest();
        req.setTenantId(tenantId);
        req.setEmployeeId(payload.getEmployeeId());
        req.setEmployeeName(payload.getEmployeeName());
        req.setEmployeeEmail(employeeEmail);
        req.setReason(payload.getReason());
        req.setResignationDate(payload.getResignationDate());
        req.setStatus("PENDING");
        req.setCreatedBy(employeeEmail);
        return requestRepository.save(req);
    }

    @Override
    public Page<OffboardingRequest> getRequests(Long tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return requestRepository.findByTenantIdOrderByResignationDateDesc(tenantId, pageable);
    }

    @Override
    public List<OffboardingRequest> getMyRequests(Long tenantId, String employeeEmail) {
        return requestRepository.findByTenantIdAndEmployeeEmail(tenantId, employeeEmail);
    }

    @Override
    public OffboardingRequest processRequest(Long id, ProcessOffboardingPayload payload, Long tenantId, String actorEmail) {
        OffboardingRequest req = requestRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("offboarding.not.found")));

        String newStatus = payload.getStatus().toUpperCase();
        req.setStatus(newStatus);
        req.setAdminNotes(payload.getAdminNotes());
        req.setUpdatedBy(actorEmail);

        // If approved, seed default clearance checklist items
        if ("APPROVED".equals(newStatus) && req.getClearanceChecklists().isEmpty()) {
            List<ClearanceChecklist> items = Arrays.asList(
                createDefaultItem(req, "Revoke email, VPN, and server credentials", "IT", actorEmail),
                createDefaultItem(req, "Complete exit interview questionnaire", "HR", actorEmail),
                createDefaultItem(req, "Return company laptop, access card, and keys", "OFFICE_MANAGER", actorEmail),
                createDefaultItem(req, "Calculate final payout settlement and tax clearance", "FINANCE", actorEmail)
            );
            req.getClearanceChecklists().addAll(items);
        }

        return requestRepository.save(req);
    }

    @Override
    public ClearanceChecklist updateClearanceItem(Long requestId, Long itemId, ClearanceChecklistPayload payload, Long tenantId, String actorEmail) {
        OffboardingRequest req = requestRepository.findByIdAndTenantId(requestId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("offboarding.not.found")));

        ClearanceChecklist item = req.getClearanceChecklists().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(msg("offboarding.clearance.not.found")));

        item.setStatus(payload.getStatus().toUpperCase());
        item.setRemarks(payload.getRemarks());
        item.setCheckedBy(actorEmail);
        item.setUpdatedBy(actorEmail);

        checklistRepository.save(item);

        // Automatically mark as COMPLETED if all items are COMPLETED
        boolean allCompleted = req.getClearanceChecklists().stream()
                .allMatch(i -> "COMPLETED".equals(i.getStatus()));
        if (allCompleted) {
            req.setStatus("COMPLETED");
            requestRepository.save(req);
        }

        return item;
    }

    private ClearanceChecklist createDefaultItem(OffboardingRequest req, String itemName, String department, String actorEmail) {
        ClearanceChecklist item = new ClearanceChecklist();
        item.setOffboardingRequest(req);
        item.setItemName(itemName);
        item.setDepartment(department);
        item.setStatus("PENDING");
        item.setCreatedBy(actorEmail);
        return item;
    }
}

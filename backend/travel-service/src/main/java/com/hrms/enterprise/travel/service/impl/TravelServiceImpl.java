package com.hrms.enterprise.travel.service.impl;

import com.hrms.enterprise.travel.dto.ProcessExpensePayload;
import com.hrms.enterprise.travel.dto.ProcessTravelPayload;
import com.hrms.enterprise.travel.dto.TravelExpensePayload;
import com.hrms.enterprise.travel.dto.TravelRequestPayload;
import com.hrms.enterprise.travel.entity.TravelExpense;
import com.hrms.enterprise.travel.entity.TravelRequest;
import com.hrms.enterprise.travel.exception.BadRequestException;
import com.hrms.enterprise.travel.exception.ResourceNotFoundException;
import com.hrms.enterprise.travel.repository.TravelExpenseRepository;
import com.hrms.enterprise.travel.repository.TravelRequestRepository;
import com.hrms.enterprise.travel.service.TravelService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TravelServiceImpl implements TravelService {

    private final TravelRequestRepository requestRepository;
    private final TravelExpenseRepository expenseRepository;
    private final MessageSource messageSource;

    public TravelServiceImpl(TravelRequestRepository requestRepository,
                             TravelExpenseRepository expenseRepository,
                             MessageSource messageSource) {
        this.requestRepository = requestRepository;
        this.expenseRepository = expenseRepository;
        this.messageSource = messageSource;
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @Override
    public TravelRequest submitRequest(TravelRequestPayload payload, Long tenantId, String employeeEmail) {
        TravelRequest req = new TravelRequest();
        req.setTenantId(tenantId);
        req.setEmployeeId(payload.getEmployeeId());
        req.setEmployeeName(payload.getEmployeeName());
        req.setEmployeeEmail(employeeEmail);
        req.setDestination(payload.getDestination());
        req.setPurpose(payload.getPurpose());
        req.setStartDate(payload.getStartDate());
        req.setEndDate(payload.getEndDate());
        req.setEstimatedBudget(payload.getEstimatedBudget());
        req.setStatus("PENDING");
        req.setCreatedBy(employeeEmail);
        return requestRepository.save(req);
    }

    @Override
    public Page<TravelRequest> getRequests(Long tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return requestRepository.findByTenantIdOrderByStartDateDesc(tenantId, pageable);
    }

    @Override
    public List<TravelRequest> getMyRequests(Long tenantId, String employeeEmail) {
        return requestRepository.findByTenantIdAndEmployeeEmailOrderByStartDateDesc(tenantId, employeeEmail);
    }

    @Override
    public TravelRequest processRequest(Long id, ProcessTravelPayload payload, Long tenantId, String actorEmail) {
        TravelRequest req = requestRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("travel.not.found")));

        req.setStatus(payload.getStatus().toUpperCase());
        req.setAdminNotes(payload.getAdminNotes());
        if (payload.getApprovedBudget() != null) {
            req.setApprovedBudget(payload.getApprovedBudget());
        }
        req.setUpdatedBy(actorEmail);

        return requestRepository.save(req);
    }

    @Override
    public TravelExpense submitExpense(Long travelRequestId, TravelExpensePayload payload, Long tenantId, String employeeEmail) {
        TravelRequest req = requestRepository.findByIdAndTenantId(travelRequestId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("travel.not.found")));

        if (!"APPROVED".equals(req.getStatus())) {
            throw new BadRequestException("Cannot submit expenses for a travel request that is not approved");
        }

        TravelExpense exp = new TravelExpense();
        exp.setTravelRequest(req);
        exp.setExpenseType(payload.getExpenseType().toUpperCase());
        exp.setAmount(payload.getAmount());
        exp.setReceiptUrl(payload.getReceiptUrl());
        exp.setDescription(payload.getDescription());
        exp.setStatus("PENDING");
        exp.setCreatedBy(employeeEmail);

        return expenseRepository.save(exp);
    }

    @Override
    public TravelExpense processExpense(Long travelRequestId, Long expenseId, ProcessExpensePayload payload, Long tenantId, String actorEmail) {
        TravelRequest req = requestRepository.findByIdAndTenantId(travelRequestId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("travel.not.found")));

        TravelExpense exp = req.getTravelExpenses().stream()
                .filter(e -> e.getId().equals(expenseId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(msg("travel.expense.not.found")));

        exp.setStatus(payload.getStatus().toUpperCase());
        exp.setUpdatedBy(actorEmail);

        return expenseRepository.save(exp);
    }
}

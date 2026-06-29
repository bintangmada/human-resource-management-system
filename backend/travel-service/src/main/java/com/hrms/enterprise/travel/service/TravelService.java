package com.hrms.enterprise.travel.service;

import com.hrms.enterprise.travel.dto.ProcessExpensePayload;
import com.hrms.enterprise.travel.dto.ProcessTravelPayload;
import com.hrms.enterprise.travel.dto.TravelExpensePayload;
import com.hrms.enterprise.travel.dto.TravelRequestPayload;
import com.hrms.enterprise.travel.entity.TravelExpense;
import com.hrms.enterprise.travel.entity.TravelRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TravelService {
    TravelRequest submitRequest(TravelRequestPayload payload, Long tenantId, String employeeEmail);
    Page<TravelRequest> getRequests(Long tenantId, int page, int size);
    List<TravelRequest> getMyRequests(Long tenantId, String employeeEmail);
    TravelRequest processRequest(Long id, ProcessTravelPayload payload, Long tenantId, String actorEmail);
    TravelExpense submitExpense(Long travelRequestId, TravelExpensePayload payload, Long tenantId, String employeeEmail);
    TravelExpense processExpense(Long travelRequestId, Long expenseId, ProcessExpensePayload payload, Long tenantId, String actorEmail);
}

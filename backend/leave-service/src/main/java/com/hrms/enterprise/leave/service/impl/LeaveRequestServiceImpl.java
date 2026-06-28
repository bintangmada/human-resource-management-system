package com.hrms.enterprise.leave.service.impl;

import com.hrms.enterprise.leave.dto.LeaveRequestDto;
import com.hrms.enterprise.leave.dto.LeaveRequestResponse;
import com.hrms.enterprise.leave.entity.LeaveBalance;
import com.hrms.enterprise.leave.entity.LeaveRequest;
import com.hrms.enterprise.leave.entity.LeaveType;
import com.hrms.enterprise.leave.exception.BadRequestException;
import com.hrms.enterprise.leave.exception.ResourceNotFoundException;
import com.hrms.enterprise.leave.repository.LeaveBalanceRepository;
import com.hrms.enterprise.leave.repository.LeaveRequestRepository;
import com.hrms.enterprise.leave.repository.LeaveTypeRepository;
import com.hrms.enterprise.leave.service.LeaveRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveRequestServiceImpl(LeaveRequestRepository leaveRequestRepository,
                                   LeaveBalanceRepository leaveBalanceRepository,
                                   LeaveTypeRepository leaveTypeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Override
    @Transactional
    public LeaveRequestResponse submitLeaveRequest(Long tenantId, Long employeeId, LeaveRequestDto request, String actorEmail) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("leave.request.invalid.dates");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        int year = request.getStartDate().getYear();

        LeaveType leaveType = leaveTypeRepository.findByIdAndTenantIdAndDeletedStatus(request.getLeaveTypeId(), tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        // Get or initialize balance
        LeaveBalance balance = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                tenantId, employeeId, leaveType.getId(), year, 0)
                .orElseGet(() -> {
                    // Create default balance on the fly
                    LeaveBalance newBalance = LeaveBalance.builder()
                            .tenantId(tenantId)
                            .employeeId(employeeId)
                            .leaveType(leaveType)
                            .year(year)
                            .entitlement(leaveType.getDefaultEntitlement())
                            .used(0)
                            .pending(0)
                            .createdBy("SYSTEM")
                            .build();
                    return leaveBalanceRepository.save(newBalance);
                });

        int remaining = balance.getEntitlement() - balance.getUsed() - balance.getPending();
        if (remaining < totalDays) {
            throw new BadRequestException("leave.balance.insufficient", remaining, totalDays);
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .tenantId(tenantId)
                .employeeId(employeeId)
                .leaveType(leaveType)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .createdBy(actorEmail)
                .build();

        if (Boolean.FALSE.equals(leaveType.getRequiresApproval())) {
            // Auto approve
            leaveRequest.setLeaveStatus("APPROVED");
            leaveRequest.setApprovedBy("AUTO_SYSTEM");
            leaveRequest.setNotes("Automatically approved as leave type does not require approval");
            balance.setUsed(balance.getUsed() + totalDays);
        } else {
            leaveRequest.setLeaveStatus("PENDING");
            balance.setPending(balance.getPending() + totalDays);
        }

        leaveBalanceRepository.save(balance);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveRequestResponse approveLeaveRequest(Long tenantId, Long id, String approverEmail, String notes) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.request.not.found"));

        if (!"PENDING".equals(leaveRequest.getLeaveStatus())) {
            throw new BadRequestException("leave.request.already.processed");
        }

        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                tenantId, leaveRequest.getEmployeeId(), leaveRequest.getLeaveType().getId(), year, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        // State changes
        leaveRequest.setLeaveStatus("APPROVED");
        leaveRequest.setApprovedBy(approverEmail);
        leaveRequest.setNotes(notes);

        balance.setPending(Math.max(0, balance.getPending() - leaveRequest.getTotalDays()));
        balance.setUsed(balance.getUsed() + leaveRequest.getTotalDays());

        leaveBalanceRepository.save(balance);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveRequestResponse rejectLeaveRequest(Long tenantId, Long id, String rejectorEmail, String notes) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.request.not.found"));

        if (!"PENDING".equals(leaveRequest.getLeaveStatus())) {
            throw new BadRequestException("leave.request.already.processed");
        }

        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                tenantId, leaveRequest.getEmployeeId(), leaveRequest.getLeaveType().getId(), year, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        // State changes
        leaveRequest.setLeaveStatus("REJECTED");
        leaveRequest.setApprovedBy(rejectorEmail);
        leaveRequest.setNotes(notes);

        balance.setPending(Math.max(0, balance.getPending() - leaveRequest.getTotalDays()));

        leaveBalanceRepository.save(balance);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveRequestResponse cancelLeaveRequest(Long tenantId, Long id, String actorEmail) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.request.not.found"));

        if (!"PENDING".equals(leaveRequest.getLeaveStatus())) {
            throw new BadRequestException("leave.request.cancel.only.pending");
        }

        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                tenantId, leaveRequest.getEmployeeId(), leaveRequest.getLeaveType().getId(), year, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        // State changes
        leaveRequest.setLeaveStatus("CANCELLED");
        leaveRequest.setNotes("Cancelled by user");

        balance.setPending(Math.max(0, balance.getPending() - leaveRequest.getTotalDays()));

        leaveBalanceRepository.save(balance);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved);
    }

    @Override
    public LeaveRequestResponse getLeaveRequest(Long tenantId, Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.request.not.found"));
        return mapToResponse(leaveRequest);
    }

    @Override
    public Page<LeaveRequestResponse> getAllLeaveRequests(Long tenantId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequest> pageResult;
        if (status != null && !status.trim().isEmpty()) {
            pageResult = leaveRequestRepository.findByTenantIdAndLeaveStatusAndDeletedStatus(tenantId, status, 0, pageable);
        } else {
            pageResult = leaveRequestRepository.findByTenantIdAndDeletedStatus(tenantId, 0, pageable);
        }
        return pageResult.map(this::mapToResponse);
    }

    @Override
    public Page<LeaveRequestResponse> getEmployeeLeaveRequests(Long tenantId, Long employeeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequest> pageResult = leaveRequestRepository.findByTenantIdAndEmployeeIdAndDeletedStatus(
                tenantId, employeeId, 0, pageable);
        return pageResult.map(this::mapToResponse);
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest entity) {
        return LeaveRequestResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .leaveTypeId(entity.getLeaveType().getId())
                .leaveTypeName(entity.getLeaveType().getName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .totalDays(entity.getTotalDays())
                .reason(entity.getReason())
                .status(entity.getLeaveStatus())
                .approvedBy(entity.getApprovedBy())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

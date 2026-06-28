package com.hrms.enterprise.leave.service.impl;

import com.hrms.enterprise.leave.dto.LeaveTypeRequest;
import com.hrms.enterprise.leave.dto.LeaveTypeResponse;
import com.hrms.enterprise.leave.entity.LeaveType;
import com.hrms.enterprise.leave.exception.ResourceNotFoundException;
import com.hrms.enterprise.leave.repository.LeaveTypeRepository;
import com.hrms.enterprise.leave.service.LeaveTypeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveTypeServiceImpl implements LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeServiceImpl(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Override
    @Transactional
    public LeaveTypeResponse createLeaveType(Long tenantId, LeaveTypeRequest request, String actorEmail) {
        LeaveType leaveType = LeaveType.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .defaultEntitlement(request.getDefaultEntitlement())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : true)
                .createdBy(actorEmail)
                .build();

        LeaveType saved = leaveTypeRepository.save(leaveType);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveTypeResponse updateLeaveType(Long tenantId, Long id, LeaveTypeRequest request, String actorEmail) {
        LeaveType leaveType = leaveTypeRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        leaveType.setName(request.getName());
        leaveType.setDefaultEntitlement(request.getDefaultEntitlement());
        if (request.getRequiresApproval() != null) {
            leaveType.setRequiresApproval(request.getRequiresApproval());
        }
        leaveType.setUpdatedBy(actorEmail);

        LeaveType saved = leaveTypeRepository.save(leaveType);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteLeaveType(Long tenantId, Long id, String actorEmail) {
        LeaveType leaveType = leaveTypeRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        leaveType.setDeletedStatus(1);
        leaveType.setDeletedBy(actorEmail);
        leaveType.setDeletedAt(java.time.LocalDateTime.now());
        leaveTypeRepository.save(leaveType);
    }

    @Override
    public LeaveTypeResponse getLeaveType(Long tenantId, Long id) {
        LeaveType leaveType = leaveTypeRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));
        return mapToResponse(leaveType);
    }

    @Override
    public Page<LeaveTypeResponse> getAllLeaveTypes(Long tenantId, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveType> pageResult;
        if (search != null && !search.trim().isEmpty()) {
            pageResult = leaveTypeRepository.findByTenantIdAndNameContainingIgnoreCaseAndDeletedStatus(
                    tenantId, search, 0, pageable);
        } else {
            pageResult = leaveTypeRepository.findByTenantIdAndDeletedStatus(tenantId, 0, pageable);
        }
        return pageResult.map(this::mapToResponse);
    }

    @Override
    public List<LeaveTypeResponse> getActiveLeaveTypes(Long tenantId) {
        return leaveTypeRepository.findByTenantIdAndDeletedStatus(tenantId, 0).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LeaveTypeResponse mapToResponse(LeaveType entity) {
        return LeaveTypeResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .defaultEntitlement(entity.getDefaultEntitlement())
                .requiresApproval(entity.getRequiresApproval())
                .build();
    }
}

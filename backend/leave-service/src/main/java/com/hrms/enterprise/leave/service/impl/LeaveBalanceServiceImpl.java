package com.hrms.enterprise.leave.service.impl;

import com.hrms.enterprise.leave.dto.LeaveBalanceResponse;
import com.hrms.enterprise.leave.entity.LeaveBalance;
import com.hrms.enterprise.leave.entity.LeaveType;
import com.hrms.enterprise.leave.exception.BadRequestException;
import com.hrms.enterprise.leave.exception.ResourceNotFoundException;
import com.hrms.enterprise.leave.repository.LeaveBalanceRepository;
import com.hrms.enterprise.leave.repository.LeaveTypeRepository;
import com.hrms.enterprise.leave.service.LeaveBalanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveBalanceServiceImpl(LeaveBalanceRepository leaveBalanceRepository, LeaveTypeRepository leaveTypeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Override
    public List<LeaveBalanceResponse> getEmployeeBalances(Long tenantId, Long employeeId, Integer year) {
        int targetYear = year != null ? year : java.time.LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndYearAndDeletedStatus(
                tenantId, employeeId, targetYear, 0);

        // If no balances found, initialize defaults automatically
        if (balances.isEmpty()) {
            initializeBalancesForEmployee(tenantId, employeeId, targetYear, "SYSTEM");
            balances = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndYearAndDeletedStatus(
                    tenantId, employeeId, targetYear, 0);
        }

        return balances.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveBalanceResponse allocateBalance(Long tenantId, Long employeeId, Long leaveTypeId, Integer year, Integer entitlement, String actorEmail) {
        int targetYear = year != null ? year : java.time.LocalDate.now().getYear();

        Optional<LeaveBalance> existing = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                tenantId, employeeId, leaveTypeId, targetYear, 0);

        if (existing.isPresent()) {
            throw new BadRequestException("leave.balance.already.exists");
        }

        LeaveType leaveType = leaveTypeRepository.findByIdAndTenantIdAndDeletedStatus(leaveTypeId, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));

        LeaveBalance balance = LeaveBalance.builder()
                .tenantId(tenantId)
                .employeeId(employeeId)
                .leaveType(leaveType)
                .year(targetYear)
                .entitlement(entitlement)
                .used(0)
                .pending(0)
                .createdBy(actorEmail)
                .build();

        LeaveBalance saved = leaveBalanceRepository.save(balance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void initializeBalancesForEmployee(Long tenantId, Long employeeId, Integer year, String actorEmail) {
        List<LeaveType> activeTypes = leaveTypeRepository.findByTenantIdAndDeletedStatus(tenantId, 0);

        // If no leave types exist at all in tenant, create default 'Cuti Tahunan' first
        if (activeTypes.isEmpty()) {
            LeaveType annualLeave = LeaveType.builder()
                    .tenantId(tenantId)
                    .name("Cuti Tahunan")
                    .defaultEntitlement(12)
                    .requiresApproval(true)
                    .createdBy("SYSTEM")
                    .build();
            leaveTypeRepository.save(annualLeave);

            LeaveType sickLeave = LeaveType.builder()
                    .tenantId(tenantId)
                    .name("Cuti Sakit")
                    .defaultEntitlement(30)
                    .requiresApproval(true)
                    .createdBy("SYSTEM")
                    .build();
            leaveTypeRepository.save(sickLeave);

            activeTypes = leaveTypeRepository.findByTenantIdAndDeletedStatus(tenantId, 0);
        }

        for (LeaveType type : activeTypes) {
            Optional<LeaveBalance> existing = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                    tenantId, employeeId, type.getId(), year, 0);

            if (existing.isEmpty()) {
                LeaveBalance balance = LeaveBalance.builder()
                        .tenantId(tenantId)
                        .employeeId(employeeId)
                        .leaveType(type)
                        .year(year)
                        .entitlement(type.getDefaultEntitlement())
                        .used(0)
                        .pending(0)
                        .createdBy(actorEmail)
                        .build();
                leaveBalanceRepository.save(balance);
            }
        }
    }

    @Override
    public LeaveBalanceResponse getEmployeeBalanceForType(Long tenantId, Long employeeId, Long leaveTypeId, Integer year) {
        int targetYear = year != null ? year : java.time.LocalDate.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
                tenantId, employeeId, leaveTypeId, targetYear, 0)
                .orElseThrow(() -> new ResourceNotFoundException("leave.type.not.found"));
        return mapToResponse(balance);
    }

    private LeaveBalanceResponse mapToResponse(LeaveBalance entity) {
        int remaining = entity.getEntitlement() - entity.getUsed() - entity.getPending();
        return LeaveBalanceResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .leaveTypeId(entity.getLeaveType().getId())
                .leaveTypeName(entity.getLeaveType().getName())
                .year(entity.getYear())
                .entitlement(entity.getEntitlement())
                .used(entity.getUsed())
                .pending(entity.getPending())
                .remaining(remaining)
                .build();
    }
}

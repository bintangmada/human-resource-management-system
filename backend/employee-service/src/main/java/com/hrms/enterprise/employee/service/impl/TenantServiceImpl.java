package com.hrms.enterprise.employee.service.impl;

import com.hrms.enterprise.employee.dto.TenantResponse;
import com.hrms.enterprise.employee.entity.Tenant;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.repository.TenantRepository;
import com.hrms.enterprise.employee.service.TenantService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementasi TenantService untuk mengelola data Tenant pada sisi Employee Service (Master Admin Dashboard).
 */
@Service
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    public TenantServiceImpl(TenantRepository tenantRepository,
                             EmployeeRepository employeeRepository) {
        this.tenantRepository = tenantRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .filter(t -> t.getDeletedStatus() == 0)
                .map(this::mapToTenantResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void triggerExpiryAlert(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant dengan ID " + id + " tidak ditemukan."));
        
        System.out.println(">>> [ALERT] Email tagihan/peringatan dikirim ke Owner: " + tenant.getOwnerEmail());
        System.out.println(">>> Pesan: Yth. " + tenant.getOwnerName() + ", layanan HRMS Enterprise untuk " 
                + tenant.getCompanyName() + " akan berakhir pada " + tenant.getExpiryDate() + ". Silakan lakukan perpanjangan.");
    }

    private TenantResponse mapToTenantResponse(Tenant tenant) {
        long count = employeeRepository.countByTenantIdAndDeletedStatus(tenant.getId(), 0);
        
        long adminCount = employeeRepository.countByTenantIdAndDeletedStatusAndJobTitle(tenant.getId(), 0, "Administrator");
        long hrCount = employeeRepository.countByTenantIdAndDeletedStatusAndJobTitle(tenant.getId(), 0, "HR Manager");
        long financeCount = employeeRepository.countByTenantIdAndDeletedStatusAndJobTitle(tenant.getId(), 0, "Finance Manager");
        long staffCount = count - adminCount - hrCount - financeCount;
        if (staffCount < 0) staffCount = 0;
        
        return TenantResponse.builder()
                .id(tenant.getId())
                .companyName(tenant.getCompanyName())
                .subdomain(tenant.getSubdomain())
                .ownerName(tenant.getOwnerName())
                .ownerEmail(tenant.getOwnerEmail())
                .plan(tenant.getPlan())
                .status(tenant.getStatus())
                .joinedAt(tenant.getCreatedAt())
                .expiryDate(tenant.getExpiryDate())
                .maxEmployees(tenant.getMaxEmployees())
                .activeEmployeeCount(count)
                .adminCount(adminCount)
                .hrCount(hrCount)
                .financeCount(financeCount)
                .staffCount(staffCount)
                .build();
    }
}

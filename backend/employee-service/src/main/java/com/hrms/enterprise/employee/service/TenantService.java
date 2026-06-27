package com.hrms.enterprise.employee.service;

import com.hrms.enterprise.employee.dto.TenantLookupResponse;
import com.hrms.enterprise.employee.dto.TenantRequest;
import com.hrms.enterprise.employee.dto.TenantResponse;
import java.util.List;

/**
 * Service TenantService menjembatani interaksi antara Controller layer
 * dan Data Access layer (Repository) untuk mengelola data Tenant.
 */
public interface TenantService {
    
    // Mendapatkan list semua tenant (untuk dashboard Master Admin)
    List<TenantResponse> getAllTenants();
    
    // Kirim email peringatan jatuh tempo manual/otomatis
    void triggerExpiryAlert(Long id);
}

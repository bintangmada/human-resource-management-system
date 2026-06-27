package com.hrms.enterprise.auth.service;

import com.hrms.enterprise.auth.dto.TenantLookupResponse;
import com.hrms.enterprise.auth.dto.TenantRequest;
import com.hrms.enterprise.auth.dto.TenantResponse;
import java.util.List;

/**
 * Service TenantService menjembatani interaksi antara Controller layer
 * dan Data Access layer (Repository) untuk mengelola data Tenant.
 */
public interface TenantService {
    
    // Mendaftarkan tenant baru dan inisialisasi data default
    TenantResponse registerTenant(TenantRequest request);
    
    // Verifikasi subdomain saat login terisolasi
    TenantLookupResponse lookupTenant(String subdomain);
    
    // Mendapatkan list semua tenant (untuk dashboard Master Admin)
    List<TenantResponse> getAllTenants();
    
    // Kirim email peringatan jatuh tempo manual/otomatis
    void triggerExpiryAlert(Long id);

    // Verifikasi email konfirmasi untuk aktivasi tenant baru
    void confirmEmail(String subdomain, String token);
}

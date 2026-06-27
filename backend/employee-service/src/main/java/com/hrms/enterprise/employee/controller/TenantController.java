package com.hrms.enterprise.employee.controller;

import com.hrms.enterprise.employee.dto.ApiResponse;
import com.hrms.enterprise.employee.dto.TenantResponse;
import com.hrms.enterprise.employee.service.TenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller TenantController mengekspos endpoint API publik dan internal
 * untuk mendukung alur onboarding, login terisolasi, dan dashboard Master Admin.
 */
@RestController
@RequestMapping("/api/v1/tenants")
@Validated
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
      * Endpoint Master Admin: Mendapatkan seluruh daftar tenant aktif di ekosistem SaaS.
      */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAllTenants() {
        List<TenantResponse> response = tenantService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.success("All tenants retrieved successfully.", response));
    }

    /**
      * Endpoint Master Admin: Mengirimkan email peringatan tagihan/jatuh tempo secara manual.
      */
    @PostMapping("/{id}/alert")
    public ResponseEntity<ApiResponse<Void>> triggerExpiryAlert(@PathVariable Long id) {
        tenantService.triggerExpiryAlert(id);
        return ResponseEntity.ok(ApiResponse.success("Billing expiry alert triggered successfully.", null));
    }
}

package com.hrms.enterprise.asset.service.impl;

import com.hrms.enterprise.asset.dto.AssetPayload;
import com.hrms.enterprise.asset.dto.AssetRequestPayload;
import com.hrms.enterprise.asset.dto.ProcessRequestPayload;
import com.hrms.enterprise.asset.entity.Asset;
import com.hrms.enterprise.asset.entity.AssetRequest;
import com.hrms.enterprise.asset.exception.BadRequestException;
import com.hrms.enterprise.asset.exception.ResourceNotFoundException;
import com.hrms.enterprise.asset.repository.AssetRepository;
import com.hrms.enterprise.asset.repository.AssetRequestRepository;
import com.hrms.enterprise.asset.service.AssetService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final AssetRequestRepository assetRequestRepository;
    private final MessageSource messageSource;
    private final RestTemplate restTemplate;

    public AssetServiceImpl(AssetRepository assetRepository,
                            AssetRequestRepository assetRequestRepository,
                            MessageSource messageSource) {
        this.assetRepository = assetRepository;
        this.assetRequestRepository = assetRequestRepository;
        this.messageSource = messageSource;
        this.restTemplate = new RestTemplate();
    }

    private String getMsg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    private Map<String, Object> lookupEmployee(String email, Long tenantId) {
        try {
            String url = "http://localhost:8022/api/v1/employees/lookup?email=" + email;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                if (Boolean.TRUE.equals(body.get("success"))) {
                    return (Map<String, Object>) body.get("data");
                }
            }
        } catch (Exception ex) {
            // Safe fallback if employee-service is offline during standalone run
            System.err.println("Fallback: employee-service lookup offline: " + ex.getMessage());
        }
        return null;
    }

    @Override
    public Asset registerAsset(AssetPayload payload, Long tenantId, String actorEmail) {
        if (assetRepository.findBySerialNumberAndTenantId(payload.getSerialNumber(), tenantId).isPresent()) {
            throw new BadRequestException(getMsg("asset.serial.exists"));
        }

        Asset asset = new Asset();
        asset.setTenantId(tenantId);
        asset.setAssetName(payload.getAssetName());
        asset.setSerialNumber(payload.getSerialNumber());
        asset.setCategory(payload.getCategory().toUpperCase());
        asset.setPurchaseDate(payload.getPurchaseDate());

        if (payload.getEmployeeId() != null) {
            asset.setEmployeeId(payload.getEmployeeId());
            asset.setEmployeeName(payload.getEmployeeName());
            asset.setAssignedDate(LocalDate.now());
            asset.setStatus("ASSIGNED");
        } else {
            asset.setStatus("AVAILABLE");
        }

        asset.setCreatedBy(actorEmail);
        asset.setUpdatedBy(actorEmail);
        return assetRepository.save(asset);
    }

    @Override
    public Asset updateAsset(Long id, AssetPayload payload, Long tenantId, String actorEmail) {
        Asset asset = assetRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("asset.not.found")));

        asset.setAssetName(payload.getAssetName());
        asset.setSerialNumber(payload.getSerialNumber());
        asset.setCategory(payload.getCategory().toUpperCase());
        asset.setPurchaseDate(payload.getPurchaseDate());

        if (payload.getEmployeeId() != null) {
            asset.setEmployeeId(payload.getEmployeeId());
            asset.setEmployeeName(payload.getEmployeeName());
            if (asset.getAssignedDate() == null) {
                asset.setAssignedDate(LocalDate.now());
            }
            asset.setStatus("ASSIGNED");
        } else {
            asset.setEmployeeId(null);
            asset.setEmployeeName(null);
            asset.setAssignedDate(null);
            asset.setStatus("AVAILABLE");
        }

        asset.setUpdatedBy(actorEmail);
        return assetRepository.save(asset);
    }

    @Override
    public Page<Asset> getAssets(Long tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return assetRepository.findByTenantId(tenantId, pageable);
    }

    @Override
    public List<Asset> getMyAssignedAssets(Long tenantId, String employeeEmail) {
        Map<String, Object> emp = lookupEmployee(employeeEmail, tenantId);
        if (emp != null && emp.get("id") != null) {
            Long empId = Long.valueOf(String.valueOf(emp.get("id")));
            return assetRepository.findByTenantIdAndEmployeeId(tenantId, empId);
        }
        return Collections.emptyList();
    }

    @Override
    public Asset getAssetDetail(Long id, Long tenantId) {
        return assetRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("asset.not.found")));
    }

    @Override
    public AssetRequest submitAssetRequest(AssetRequestPayload payload, Long tenantId, String actorEmail) {
        Map<String, Object> emp = lookupEmployee(actorEmail, tenantId);
        String resolvedName = emp != null ? (String) emp.get("name") : "Employee User";

        AssetRequest req = new AssetRequest();
        req.setTenantId(tenantId);
        req.setAssetId(payload.getAssetId());
        req.setAssetName(payload.getAssetName());
        req.setEmployeeId(payload.getEmployeeId());
        req.setEmployeeName(resolvedName);
        req.setRequestType(payload.getRequestType().toUpperCase());
        req.setReason(payload.getReason());
        req.setStatus("PENDING");
        req.setCreatedBy(actorEmail);

        return assetRequestRepository.save(req);
    }

    @Override
    public AssetRequest processAssetRequest(Long id, ProcessRequestPayload payload, Long tenantId, String actorEmail) {
        AssetRequest req = assetRequestRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("asset.request.not.found")));

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException(getMsg("asset.request.invalid"));
        }

        String newStatus = payload.getStatus().toUpperCase();
        req.setStatus(newStatus);
        req.setAdminNotes(payload.getAdminNotes());
        req.setUpdatedBy(actorEmail);

        if ("APPROVED".equals(newStatus)) {
            if ("REQUISITION".equals(req.getRequestType()) && req.getAssetId() != null) {
                // Assign asset to employee
                Asset asset = assetRepository.findByIdAndTenantId(req.getAssetId(), tenantId).orElse(null);
                if (asset != null) {
                    asset.setEmployeeId(req.getEmployeeId());
                    asset.setEmployeeName(req.getEmployeeName());
                    asset.setAssignedDate(LocalDate.now());
                    asset.setStatus("ASSIGNED");
                    assetRepository.save(asset);
                }
            } else if ("RETURN".equals(req.getRequestType()) && req.getAssetId() != null) {
                // Free up asset
                Asset asset = assetRepository.findByIdAndTenantId(req.getAssetId(), tenantId).orElse(null);
                if (asset != null) {
                    asset.setEmployeeId(null);
                    asset.setEmployeeName(null);
                    asset.setAssignedDate(null);
                    asset.setStatus("AVAILABLE");
                    assetRepository.save(asset);
                }
            } else if ("REPAIR".equals(req.getRequestType()) && req.getAssetId() != null) {
                // Tag asset as under repair
                Asset asset = assetRepository.findByIdAndTenantId(req.getAssetId(), tenantId).orElse(null);
                if (asset != null) {
                    asset.setStatus("UNDER_REPAIR");
                    assetRepository.save(asset);
                }
            }
        }

        return assetRequestRepository.save(req);
    }

    @Override
    public Page<AssetRequest> getAssetRequests(Long tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return assetRequestRepository.findByTenantId(tenantId, pageable);
    }

    @Override
    public Page<AssetRequest> getMyAssetRequests(Long tenantId, String employeeEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Map<String, Object> emp = lookupEmployee(employeeEmail, tenantId);
        if (emp != null && emp.get("id") != null) {
            Long empId = Long.valueOf(String.valueOf(emp.get("id")));
            return assetRequestRepository.findByTenantIdAndEmployeeId(tenantId, empId, pageable);
        }
        return Page.empty(pageable);
    }
}

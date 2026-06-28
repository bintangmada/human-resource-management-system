package com.hrms.enterprise.asset.controller;

import com.hrms.enterprise.asset.dto.*;
import com.hrms.enterprise.asset.entity.Asset;
import com.hrms.enterprise.asset.entity.AssetRequest;
import com.hrms.enterprise.asset.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    // --- Asset Directory Endpoints ---

    @PostMapping
    public ResponseEntity<ApiResponse<Asset>> registerAsset(
            @Valid @RequestBody AssetPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Asset data = assetService.registerAsset(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Asset registered successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Asset data = assetService.updateAsset(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Asset updated successfully", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Asset>>> getAssets(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Asset> data = assetService.getAssets(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Assets retrieved", data));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Asset>>> getMyAssignedAssets(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        List<Asset> data = assetService.getMyAssignedAssets(tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("My assigned assets retrieved", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> getAssetDetail(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        Asset data = assetService.getAssetDetail(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Asset details retrieved", data));
    }

    // --- Asset Request Endpoints ---

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<AssetRequest>> submitAssetRequest(
            @Valid @RequestBody AssetRequestPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        AssetRequest data = assetService.submitAssetRequest(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Asset request submitted successfully", data));
    }

    @PutMapping("/requests/{id}/process")
    public ResponseEntity<ApiResponse<AssetRequest>> processAssetRequest(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRequestPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        AssetRequest data = assetService.processAssetRequest(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Asset request processed successfully", data));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Page<AssetRequest>>> getAssetRequests(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AssetRequest> data = assetService.getAssetRequests(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Asset requests retrieved", data));
    }

    @GetMapping("/requests/my")
    public ResponseEntity<ApiResponse<Page<AssetRequest>>> getMyAssetRequests(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AssetRequest> data = assetService.getMyAssetRequests(tenantId, actorEmail, page, size);
        return ResponseEntity.ok(ApiResponse.success("My asset requests retrieved", data));
    }
}

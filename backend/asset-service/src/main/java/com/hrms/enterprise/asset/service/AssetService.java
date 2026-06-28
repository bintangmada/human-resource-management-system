package com.hrms.enterprise.asset.service;

import com.hrms.enterprise.asset.dto.AssetPayload;
import com.hrms.enterprise.asset.dto.AssetRequestPayload;
import com.hrms.enterprise.asset.dto.ProcessRequestPayload;
import com.hrms.enterprise.asset.entity.Asset;
import com.hrms.enterprise.asset.entity.AssetRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AssetService {

    Asset registerAsset(AssetPayload payload, Long tenantId, String actorEmail);

    Asset updateAsset(Long id, AssetPayload payload, Long tenantId, String actorEmail);

    Page<Asset> getAssets(Long tenantId, int page, int size);

    List<Asset> getMyAssignedAssets(Long tenantId, String employeeEmail);

    Asset getAssetDetail(Long id, Long tenantId);

    AssetRequest submitAssetRequest(AssetRequestPayload payload, Long tenantId, String actorEmail);

    AssetRequest processAssetRequest(Long id, ProcessRequestPayload payload, Long tenantId, String actorEmail);

    Page<AssetRequest> getAssetRequests(Long tenantId, int page, int size);

    Page<AssetRequest> getMyAssetRequests(Long tenantId, String employeeEmail, int page, int size);
}

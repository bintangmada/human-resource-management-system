package com.hrms.enterprise.performance.service;

import com.hrms.enterprise.performance.dto.PerformanceReviewPayload;
import com.hrms.enterprise.performance.dto.PerformanceReviewResponse;
import org.springframework.data.domain.Page;

public interface PerformanceService {

    PerformanceReviewResponse saveDraft(PerformanceReviewPayload payload, Long tenantId, String actorEmail);

    PerformanceReviewResponse submitReview(PerformanceReviewPayload payload, Long tenantId, String actorEmail);

    PerformanceReviewResponse approveReview(Long id, Long tenantId, String actorEmail);

    Page<PerformanceReviewResponse> getReviews(Long tenantId, String status, Long employeeId, int page, int size);

    Page<PerformanceReviewResponse> getMyReviews(Long tenantId, String actorEmail, int page, int size);

    PerformanceReviewResponse getReviewDetail(Long id, Long tenantId);
}

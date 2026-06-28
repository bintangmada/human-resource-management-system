package com.hrms.enterprise.performance.service.impl;

import com.hrms.enterprise.performance.dto.PerformanceReviewPayload;
import com.hrms.enterprise.performance.dto.PerformanceReviewResponse;
import com.hrms.enterprise.performance.entity.PerformanceReview;
import com.hrms.enterprise.performance.exception.BadRequestException;
import com.hrms.enterprise.performance.exception.ResourceNotFoundException;
import com.hrms.enterprise.performance.repository.PerformanceReviewRepository;
import com.hrms.enterprise.performance.service.PerformanceService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.ParameterizedTypeReference;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceReviewRepository reviewRepository;
    private final MessageSource messageSource;
    private final RestTemplate restTemplate;

    public PerformanceServiceImpl(PerformanceReviewRepository reviewRepository, MessageSource messageSource) {
        this.reviewRepository = reviewRepository;
        this.messageSource = messageSource;
        this.restTemplate = new RestTemplate();
    }

    private String getMsg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    // Resolve employee by ID using employee-service
    private Map<String, Object> resolveEmployeeById(Long id, Long tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = "http://localhost:8022/api/v1/employees";

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object dataObj = response.getBody().get("data");
                if (dataObj instanceof List) {
                    List<Map<String, Object>> employees = (List<Map<String, Object>>) dataObj;
                    for (Map<String, Object> emp : employees) {
                        Number empId = (Number) emp.get("id");
                        if (empId != null && empId.longValue() == id) {
                            return emp;
                        }
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Could not resolve employee via REST: " + ex.getMessage());
        }

        // Mock Fallback
        Map<String, Object> mock = new HashMap<>();
        mock.put("id", id);
        mock.put("fullName", "Employee #" + id);
        mock.put("employeeNumber", "EMP-" + id);
        return mock;
    }

    // Resolve employee by Email
    private Map<String, Object> resolveEmployeeByEmail(String email, Long tenantId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Tenant-ID", String.valueOf(tenantId));
            headers.set("X-User-Email", email);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = "http://localhost:8022/api/v1/employees";

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object dataObj = response.getBody().get("data");
                if (dataObj instanceof List) {
                    List<Map<String, Object>> employees = (List<Map<String, Object>>) dataObj;
                    for (Map<String, Object> emp : employees) {
                        if (email.equalsIgnoreCase((String) emp.get("email"))) {
                            return emp;
                        }
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Could not resolve employee by email via REST: " + ex.getMessage());
        }

        // Mock Fallback
        Map<String, Object> mock = new HashMap<>();
        mock.put("id", 999L);
        mock.put("fullName", "Actor Reviewer");
        mock.put("employeeNumber", "REV-999");
        return mock;
    }

    private BigDecimal calculateFinalScore(PerformanceReviewPayload p) {
        double sum = p.getScoreJobKnowledge() + p.getScoreWorkQuality() 
                + p.getScorePunctuality() + p.getScoreTeamwork() 
                + p.getScoreCommunication();
        return BigDecimal.valueOf(sum / 5.0).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public PerformanceReviewResponse saveDraft(PerformanceReviewPayload payload, Long tenantId, String actorEmail) {
        return createOrUpdateReview(payload, tenantId, actorEmail, "DRAFT");
    }

    @Override
    public PerformanceReviewResponse submitReview(PerformanceReviewPayload payload, Long tenantId, String actorEmail) {
        return createOrUpdateReview(payload, tenantId, actorEmail, "SUBMITTED");
    }

    private PerformanceReviewResponse createOrUpdateReview(
            PerformanceReviewPayload payload, Long tenantId, String actorEmail, String status) {

        Map<String, Object> emp = resolveEmployeeById(payload.getEmployeeId(), tenantId);
        Map<String, Object> reviewer = resolveEmployeeByEmail(actorEmail, tenantId);

        PerformanceReview review = new PerformanceReview();
        review.setTenantId(tenantId);
        review.setEmployeeId(payload.getEmployeeId());
        review.setEmployeeName((String) emp.get("fullName"));
        review.setEmployeeNumber((String) emp.get("employeeNumber"));
        
        review.setReviewerId(((Number) reviewer.get("id")).longValue());
        review.setReviewerName((String) reviewer.get("fullName"));
        review.setReviewPeriod(payload.getReviewPeriod());
        
        review.setScoreJobKnowledge(payload.getScoreJobKnowledge());
        review.setScoreWorkQuality(payload.getScoreWorkQuality());
        review.setScorePunctuality(payload.getScorePunctuality());
        review.setScoreTeamwork(payload.getScoreTeamwork());
        review.setScoreCommunication(payload.getScoreCommunication());
        
        review.setFinalScore(calculateFinalScore(payload));
        review.setFeedback(payload.getFeedback());
        review.setStatus(status);
        
        review.setCreatedBy(actorEmail);
        review.setUpdatedBy(actorEmail);

        PerformanceReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Override
    public PerformanceReviewResponse approveReview(Long id, Long tenantId, String actorEmail) {
        PerformanceReview review = reviewRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("review.not.found")));

        if ("APPROVED".equals(review.getStatus())) {
            throw new BadRequestException(getMsg("review.already.submitted"));
        }

        review.setStatus("APPROVED");
        review.setUpdatedBy(actorEmail);

        PerformanceReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Override
    public Page<PerformanceReviewResponse> getReviews(Long tenantId, String status, Long employeeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<PerformanceReview> pageResult;

        if (employeeId != null) {
            pageResult = reviewRepository.findByTenantIdAndEmployeeId(tenantId, employeeId, pageable);
        } else if (status != null && !status.isEmpty()) {
            pageResult = reviewRepository.findByTenantIdAndStatus(tenantId, status.toUpperCase(), pageable);
        } else {
            pageResult = reviewRepository.findByTenantId(tenantId, pageable);
        }

        return pageResult.map(this::mapToResponse);
    }

    @Override
    public Page<PerformanceReviewResponse> getMyReviews(Long tenantId, String actorEmail, int page, int size) {
        Map<String, Object> emp = resolveEmployeeByEmail(actorEmail, tenantId);
        Long employeeId = ((Number) emp.get("id")).longValue();
        return getReviews(tenantId, null, employeeId, page, size);
    }

    @Override
    public PerformanceReviewResponse getReviewDetail(Long id, Long tenantId) {
        PerformanceReview review = reviewRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("review.not.found")));
        return mapToResponse(review);
    }

    private PerformanceReviewResponse mapToResponse(PerformanceReview review) {
        PerformanceReviewResponse res = new PerformanceReviewResponse();
        res.setId(review.getId());
        res.setTenantId(review.getTenantId());
        res.setEmployeeId(review.getEmployeeId());
        res.setEmployeeName(review.getEmployeeName());
        res.setEmployeeNumber(review.getEmployeeNumber());
        res.setReviewerId(review.getReviewerId());
        res.setReviewerName(review.getReviewerName());
        res.setReviewPeriod(review.getReviewPeriod());
        res.setScoreJobKnowledge(review.getScoreJobKnowledge());
        res.setScoreWorkQuality(review.getScoreWorkQuality());
        res.setScorePunctuality(review.getScorePunctuality());
        res.setScoreTeamwork(review.getScoreTeamwork());
        res.setScoreCommunication(review.getScoreCommunication());
        res.setFinalScore(review.getFinalScore());
        res.setStatus(review.getStatus());
        res.setFeedback(review.getFeedback());
        res.setCreatedAt(review.getCreatedAt());
        res.setCreatedBy(review.getCreatedBy());
        return res;
    }
}

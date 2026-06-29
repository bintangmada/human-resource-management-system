package com.hrms.enterprise.training.controller;

import com.hrms.enterprise.training.dto.*;
import com.hrms.enterprise.training.entity.Training;
import com.hrms.enterprise.training.entity.TrainingEnrollment;
import com.hrms.enterprise.training.service.TrainingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Training>> create(
            @Valid @RequestBody TrainingPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Training data = trainingService.createTraining(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Training program created successfully", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Training>>> list(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Training> data = trainingService.getTrainings(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Training programs retrieved", data));
    }

    @PutMapping("/{id}/process")
    public ResponseEntity<ApiResponse<Training>> process(
            @PathVariable Long id,
            @Valid @RequestBody ProcessTrainingPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Training data = trainingService.processTraining(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Training status updated successfully", data));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<ApiResponse<TrainingEnrollment>> enroll(
            @PathVariable Long id,
            @Valid @RequestBody EnrollmentPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        TrainingEnrollment data = trainingService.enrollInTraining(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Enrolled in training program successfully", data));
    }

    @PutMapping("/{id}/enrollments/{enrollmentId}")
    public ResponseEntity<ApiResponse<TrainingEnrollment>> updateEnrollment(
            @PathVariable Long id,
            @PathVariable Long enrollmentId,
            @Valid @RequestBody UpdateEnrollmentPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        TrainingEnrollment data = trainingService.updateEnrollment(id, enrollmentId, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Enrollment status updated successfully", data));
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<ApiResponse<List<TrainingEnrollment>>> myEnrollments(
            @RequestHeader("X-User-Email") String actorEmail) {
        List<TrainingEnrollment> data = trainingService.getMyEnrollments(actorEmail);
        return ResponseEntity.ok(ApiResponse.success("My enrollments retrieved", data));
    }
}

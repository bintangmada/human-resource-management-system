package com.hrms.enterprise.training.service.impl;

import com.hrms.enterprise.training.dto.EnrollmentPayload;
import com.hrms.enterprise.training.dto.ProcessTrainingPayload;
import com.hrms.enterprise.training.dto.TrainingPayload;
import com.hrms.enterprise.training.dto.UpdateEnrollmentPayload;
import com.hrms.enterprise.training.entity.Training;
import com.hrms.enterprise.training.entity.TrainingEnrollment;
import com.hrms.enterprise.training.exception.BadRequestException;
import com.hrms.enterprise.training.exception.ResourceNotFoundException;
import com.hrms.enterprise.training.repository.TrainingEnrollmentRepository;
import com.hrms.enterprise.training.repository.TrainingRepository;
import com.hrms.enterprise.training.service.TrainingService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class TrainingServiceImpl implements TrainingService {

    private final TrainingRepository trainingRepository;
    private final TrainingEnrollmentRepository enrollmentRepository;
    private final MessageSource messageSource;

    public TrainingServiceImpl(TrainingRepository trainingRepository,
                               TrainingEnrollmentRepository enrollmentRepository,
                               MessageSource messageSource) {
        this.trainingRepository = trainingRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.messageSource = messageSource;
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @Override
    public Training createTraining(TrainingPayload payload, Long tenantId, String actorEmail) {
        Training tr = new Training();
        tr.setTenantId(tenantId);
        tr.setTitle(payload.getTitle());
        tr.setDescription(payload.getDescription());
        tr.setTrainer(payload.getTrainer());
        tr.setScheduleDate(payload.getScheduleDate());
        tr.setDurationHours(payload.getDurationHours());
        tr.setCapacity(payload.getCapacity());
        tr.setStatus("UPCOMING");
        tr.setCreatedBy(actorEmail);
        return trainingRepository.save(tr);
    }

    @Override
    public Page<Training> getTrainings(Long tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return trainingRepository.findByTenantIdOrderByScheduleDateDesc(tenantId, pageable);
    }

    @Override
    public Training processTraining(Long id, ProcessTrainingPayload payload, Long tenantId, String actorEmail) {
        Training tr = trainingRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("training.not.found")));
        tr.setStatus(payload.getStatus().toUpperCase());
        tr.setUpdatedBy(actorEmail);
        return trainingRepository.save(tr);
    }

    @Override
    public TrainingEnrollment enrollInTraining(Long trainingId, EnrollmentPayload payload, Long tenantId, String employeeEmail) {
        Training tr = trainingRepository.findByIdAndTenantId(trainingId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("training.not.found")));

        if (enrollmentRepository.existsByTrainingIdAndEmployeeEmail(trainingId, employeeEmail)) {
            throw new BadRequestException(msg("training.already.enrolled"));
        }

        long activeEnrollmentCount = tr.getEnrollments().stream()
                .filter(e -> !"CANCELLED".equals(e.getStatus()))
                .count();

        if (activeEnrollmentCount >= tr.getCapacity()) {
            throw new BadRequestException(msg("training.capacity.full"));
        }

        TrainingEnrollment enr = new TrainingEnrollment();
        enr.setTraining(tr);
        enr.setEmployeeId(payload.getEmployeeId());
        enr.setEmployeeName(payload.getEmployeeName());
        enr.setEmployeeEmail(employeeEmail);
        enr.setEnrollmentDate(LocalDate.now());
        enr.setStatus("ENROLLED");
        enr.setCreatedBy(employeeEmail);

        return enrollmentRepository.save(enr);
    }

    @Override
    public TrainingEnrollment updateEnrollment(Long trainingId, Long enrollmentId, UpdateEnrollmentPayload payload, Long tenantId, String actorEmail) {
        Training tr = trainingRepository.findByIdAndTenantId(trainingId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("training.not.found")));

        TrainingEnrollment enr = tr.getEnrollments().stream()
                .filter(e -> e.getId().equals(enrollmentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(msg("training.enrollment.not.found")));

        enr.setStatus(payload.getStatus().toUpperCase());
        if (payload.getCertificateUrl() != null) {
            enr.setCertificateUrl(payload.getCertificateUrl());
        }
        if (payload.getFeedback() != null) {
            enr.setFeedback(payload.getFeedback());
        }
        enr.setUpdatedBy(actorEmail);

        return enrollmentRepository.save(enr);
    }

    @Override
    public List<TrainingEnrollment> getMyEnrollments(String employeeEmail) {
        return enrollmentRepository.findByEmployeeEmail(employeeEmail);
    }
}

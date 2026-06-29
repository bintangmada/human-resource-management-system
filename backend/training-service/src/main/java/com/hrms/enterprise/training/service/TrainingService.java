package com.hrms.enterprise.training.service;

import com.hrms.enterprise.training.dto.EnrollmentPayload;
import com.hrms.enterprise.training.dto.ProcessTrainingPayload;
import com.hrms.enterprise.training.dto.TrainingPayload;
import com.hrms.enterprise.training.dto.UpdateEnrollmentPayload;
import com.hrms.enterprise.training.entity.Training;
import com.hrms.enterprise.training.entity.TrainingEnrollment;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TrainingService {
    Training createTraining(TrainingPayload payload, Long tenantId, String actorEmail);
    Page<Training> getTrainings(Long tenantId, int page, int size);
    Training processTraining(Long id, ProcessTrainingPayload payload, Long tenantId, String actorEmail);
    TrainingEnrollment enrollInTraining(Long trainingId, EnrollmentPayload payload, Long tenantId, String employeeEmail);
    TrainingEnrollment updateEnrollment(Long trainingId, Long enrollmentId, UpdateEnrollmentPayload payload, Long tenantId, String actorEmail);
    List<TrainingEnrollment> getMyEnrollments(String employeeEmail);
}

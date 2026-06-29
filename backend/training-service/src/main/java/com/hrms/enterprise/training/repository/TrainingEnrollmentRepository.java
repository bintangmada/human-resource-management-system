package com.hrms.enterprise.training.repository;

import com.hrms.enterprise.training.entity.TrainingEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    List<TrainingEnrollment> findByEmployeeEmail(String employeeEmail);
    boolean existsByTrainingIdAndEmployeeEmail(Long trainingId, String employeeEmail);
    Optional<TrainingEnrollment> findByIdAndTrainingId(Long id, Long trainingId);
}

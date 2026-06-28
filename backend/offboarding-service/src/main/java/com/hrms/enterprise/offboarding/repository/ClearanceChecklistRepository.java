package com.hrms.enterprise.offboarding.repository;

import com.hrms.enterprise.offboarding.entity.ClearanceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClearanceChecklistRepository extends JpaRepository<ClearanceChecklist, Long> {
    List<ClearanceChecklist> findByOffboardingRequestId(Long offboardingRequestId);
}

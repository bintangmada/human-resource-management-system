package com.hrms.enterprise.recruitment.service;

import com.hrms.enterprise.recruitment.dto.JobApplicationPayload;
import com.hrms.enterprise.recruitment.dto.JobPostingPayload;
import com.hrms.enterprise.recruitment.dto.UpdateStagePayload;
import com.hrms.enterprise.recruitment.entity.JobApplication;
import com.hrms.enterprise.recruitment.entity.JobPosting;
import org.springframework.data.domain.Page;

public interface RecruitmentService {

    JobPosting createJobPosting(JobPostingPayload payload, Long tenantId, String actorEmail);

    JobPosting updateJobPosting(Long id, JobPostingPayload payload, Long tenantId, String actorEmail);

    Page<JobPosting> getJobPostings(Long tenantId, String status, int page, int size);

    JobPosting getJobPostingDetail(Long id, Long tenantId);

    JobApplication applyJob(JobApplicationPayload payload, Long tenantId);

    JobApplication updateRecruitmentStage(Long id, UpdateStagePayload payload, Long tenantId, String actorEmail);

    Page<JobApplication> getJobApplications(Long tenantId, Long jobPostingId, String status, int page, int size);

    JobApplication getJobApplicationDetail(Long id, Long tenantId);
}

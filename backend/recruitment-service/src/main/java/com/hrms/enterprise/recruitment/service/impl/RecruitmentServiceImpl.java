package com.hrms.enterprise.recruitment.service.impl;

import com.hrms.enterprise.recruitment.dto.JobApplicationPayload;
import com.hrms.enterprise.recruitment.dto.JobPostingPayload;
import com.hrms.enterprise.recruitment.dto.UpdateStagePayload;
import com.hrms.enterprise.recruitment.entity.JobApplication;
import com.hrms.enterprise.recruitment.entity.JobPosting;
import com.hrms.enterprise.recruitment.exception.BadRequestException;
import com.hrms.enterprise.recruitment.exception.ResourceNotFoundException;
import com.hrms.enterprise.recruitment.repository.JobApplicationRepository;
import com.hrms.enterprise.recruitment.repository.JobPostingRepository;
import com.hrms.enterprise.recruitment.service.RecruitmentService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RecruitmentServiceImpl implements RecruitmentService {

    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final MessageSource messageSource;

    public RecruitmentServiceImpl(JobPostingRepository jobPostingRepository,
                                  JobApplicationRepository jobApplicationRepository,
                                  MessageSource messageSource) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.messageSource = messageSource;
    }

    private String getMsg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    @Override
    public JobPosting createJobPosting(JobPostingPayload payload, Long tenantId, String actorEmail) {
        JobPosting posting = new JobPosting();
        posting.setTenantId(tenantId);
        posting.setTitle(payload.getTitle());
        posting.setDepartmentId(payload.getDepartmentId());
        posting.setDepartmentName(payload.getDepartmentName());
        posting.setDescription(payload.getDescription());
        posting.setRequirements(payload.getRequirements());
        posting.setLocation(payload.getLocation());
        posting.setEmploymentType(payload.getEmploymentType().toUpperCase());
        posting.setStatus(payload.getStatus().toUpperCase());
        posting.setCreatedBy(actorEmail);
        posting.setUpdatedBy(actorEmail);
        return jobPostingRepository.save(posting);
    }

    @Override
    public JobPosting updateJobPosting(Long id, JobPostingPayload payload, Long tenantId, String actorEmail) {
        JobPosting posting = jobPostingRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("job.posting.not.found")));

        posting.setTitle(payload.getTitle());
        posting.setDepartmentId(payload.getDepartmentId());
        posting.setDepartmentName(payload.getDepartmentName());
        posting.setDescription(payload.getDescription());
        posting.setRequirements(payload.getRequirements());
        posting.setLocation(payload.getLocation());
        posting.setEmploymentType(payload.getEmploymentType().toUpperCase());
        posting.setStatus(payload.getStatus().toUpperCase());
        posting.setUpdatedBy(actorEmail);
        return jobPostingRepository.save(posting);
    }

    @Override
    public Page<JobPosting> getJobPostings(Long tenantId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (status != null && !status.isEmpty()) {
            return jobPostingRepository.findByTenantIdAndStatus(tenantId, status.toUpperCase(), pageable);
        }
        return jobPostingRepository.findByTenantId(tenantId, pageable);
    }

    @Override
    public JobPosting getJobPostingDetail(Long id, Long tenantId) {
        return jobPostingRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("job.posting.not.found")));
    }

    @Override
    public JobApplication applyJob(JobApplicationPayload payload, Long tenantId) {
        JobPosting posting = jobPostingRepository.findByIdAndTenantId(payload.getJobPostingId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("job.posting.not.found")));

        if (!"ACTIVE".equals(posting.getStatus())) {
            throw new BadRequestException("This job vacancy is no longer accepting applications");
        }

        JobApplication app = new JobApplication();
        app.setTenantId(tenantId);
        app.setJobPostingId(payload.getJobPostingId());
        app.setJobTitle(posting.getTitle());
        app.setCandidateName(payload.getCandidateName());
        app.setCandidateEmail(payload.getCandidateEmail());
        app.setCandidatePhone(payload.getCandidatePhone());
        app.setResumeUrl(payload.getResumeUrl());
        app.setCoverLetter(payload.getCoverLetter());
        app.setStatus("APPLIED");
        app.setCreatedBy("CANDIDATE_PORTAL");
        return jobApplicationRepository.save(app);
    }

    @Override
    public JobApplication updateRecruitmentStage(Long id, UpdateStagePayload payload, Long tenantId, String actorEmail) {
        JobApplication app = jobApplicationRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("job.application.not.found")));

        String newStatus = payload.getStatus().toUpperCase();
        if (!"APPLIED".equals(newStatus) && !"SCREENING".equals(newStatus) && 
            !"INTERVIEW".equals(newStatus) && !"OFFERED".equals(newStatus) && 
            !"HIRED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            throw new BadRequestException(getMsg("job.application.status.invalid"));
        }

        app.setStatus(newStatus);
        app.setRecruitmentNotes(payload.getRecruitmentNotes());
        app.setUpdatedBy(actorEmail);
        return jobApplicationRepository.save(app);
    }

    @Override
    public Page<JobApplication> getJobApplications(Long tenantId, Long jobPostingId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (jobPostingId != null) {
            return jobApplicationRepository.findByTenantIdAndJobPostingId(tenantId, jobPostingId, pageable);
        } else if (status != null && !status.isEmpty()) {
            return jobApplicationRepository.findByTenantIdAndStatus(tenantId, status.toUpperCase(), pageable);
        }
        return jobApplicationRepository.findByTenantId(tenantId, pageable);
    }

    @Override
    public JobApplication getJobApplicationDetail(Long id, Long tenantId) {
        return jobApplicationRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("job.application.not.found")));
    }
}

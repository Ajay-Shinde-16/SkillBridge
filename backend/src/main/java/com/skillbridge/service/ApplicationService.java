package com.skillbridge.service;

import com.skillbridge.model.Application;
import com.skillbridge.model.Job;
import com.skillbridge.model.User;
import com.skillbridge.repository.ApplicationRepository;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobService jobService;

    public Application applyToJob(String seekerId, String jobId, String coverLetter) {
        if (applicationRepository.findBySeekerIdAndJobId(seekerId, jobId).isPresent()) {
            throw new RuntimeException("Already applied to this job");
        }
        User seeker = userRepository.findById(seekerId)
            .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Job job = jobService.getJobById(jobId);

        Application app = new Application();
        app.setSeekerId(seekerId);
        app.setJobId(jobId);
        app.setSeekerName(seeker.getName());
        app.setSeekerEmail(seeker.getEmail());
        app.setJobTitle(job.getTitle());
        app.setCompanyName(job.getCompanyName());
        app.setStatus("APPLIED");
        app.setCoverLetter(coverLetter);
        app.setResumeUrl(seeker.getResumeUrl());
        app.setSkillMatchScore(jobService.calculateSkillMatchScore(seekerId, jobId));
        app.setAppliedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());

        jobService.incrementApplicationCount(jobId);
        return applicationRepository.save(app);
    }

    public List<Application> getSeekerApplications(String seekerId) {
        return applicationRepository.findBySeekerId(seekerId);
    }

    public List<Application> getJobApplications(String jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStatus(String appId, String status, String employerNote) {
        Application app = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status);
        if (employerNote != null) app.setEmployerNote(employerNote);
        app.setUpdatedAt(LocalDateTime.now());
        return applicationRepository.save(app);
    }

    public Application getById(String id) {
        return applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}

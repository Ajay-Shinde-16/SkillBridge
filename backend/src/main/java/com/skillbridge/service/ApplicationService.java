package com.skillbridge.service;

import com.skillbridge.model.Application;
import com.skillbridge.model.Job;
import com.skillbridge.model.User;
import com.skillbridge.repository.ApplicationRepository;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.service.NotificationService;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public Application applyToJob(String seekerId, String jobId, String coverLetter) {
        if (applicationRepository.findBySeekerIdAndJobId(seekerId, jobId).isPresent())
            throw new RuntimeException("Already applied to this job");

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
        Application saved = applicationRepository.save(app);

        // Auto email: Application confirmation
        emailService.sendApplicationConfirmationEmail(
            seeker.getEmail(), seeker.getName(),
            job.getTitle(), job.getCompanyName(),
            saved.getSkillMatchScore()
        );
        return saved;
    }

    public void withdrawApplication(String appId, String seekerId) {
        Application app = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!app.getSeekerId().equals(seekerId))
            throw new RuntimeException("Not authorized to withdraw this application");
        if (List.of("OFFERED", "ACCEPTED", "INTERVIEW_SCHEDULED").contains(app.getStatus()))
            throw new RuntimeException("Cannot withdraw — application is at " + app.getStatus() + " stage");
        applicationRepository.deleteById(appId);
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

        String previousStatus = app.getStatus();
        app.setStatus(status);
        if (employerNote != null && !employerNote.isEmpty()) app.setEmployerNote(employerNote);
        app.setUpdatedAt(LocalDateTime.now());
        Application saved = applicationRepository.save(app);

        // Send emails only when status actually changes
        if (!status.equals(previousStatus)) {
            User seeker = userRepository.findById(app.getSeekerId()).orElse(null);
            if (seeker != null) {
                switch (status) {
                    case "SHORTLISTED" -> {
                        emailService.sendShortlistEmail(
                            seeker.getEmail(), seeker.getName(),
                            app.getJobTitle(), app.getCompanyName()
                        );
                        notificationService.create(seeker.getId(),
                            "⭐ You've been Shortlisted!",
                            "Congratulations! You've been shortlisted for " + app.getJobTitle() + " at " + app.getCompanyName(),
                            "SHORTLIST", "/seeker/applications");
                    }
                    case "OFFERED" -> {
                        notificationService.create(seeker.getId(),
                            "🎉 Job Offer Received!",
                            "You have received an offer for " + app.getJobTitle() + " at " + app.getCompanyName() + ". Please accept or decline.",
                            "OFFER", "/seeker/offers");
                        // Fetch job details for PDF offer letter
                        Job job = jobRepository.findById(app.getJobId()).orElse(null);
                        // Fetch employer details
                        User employer = job != null
                            ? userRepository.findById(job.getEmployerId()).orElse(null)
                            : null;

                        emailService.sendOfferLetterEmail(
                            seeker.getEmail(),
                            seeker.getName(),
                            app.getJobTitle(),
                            app.getCompanyName(),
                            employer != null ? employer.getCompanyWebsite() : "",
                            employer != null ? employer.getName() : app.getCompanyName(),
                            job != null ? job.getMinSalary() : 0,
                            job != null ? job.getMaxSalary() : 0,
                            job != null ? job.getJobType() : "FULL_TIME",
                            job != null && job.isRemote(),
                            employerNote
                        );
                    }
                    default -> log.info("Status: {} — no email trigger", status);
                }
            }
        }
        return saved;
    }

    public Application getById(String id) {
        return applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}

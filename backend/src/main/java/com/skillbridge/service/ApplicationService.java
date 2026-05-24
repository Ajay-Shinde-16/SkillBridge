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

        // Notify seeker
        notificationService.create(seeker.getId(),
            "📨 Application Submitted!",
            "Your application for " + job.getTitle() + " at " + job.getCompanyName() + " has been submitted successfully!",
            "APPLICATION", "/seeker/applications");

        // Notify employer — new application received
        notificationService.create(job.getEmployerId(),
            "👤 New Application from " + seeker.getName(),
            seeker.getName() + " has applied for " + job.getTitle() + ". Skill match: " + saved.getSkillMatchScore() + "%. Review now!",
            "APPLICATION", "/employer/applications/" + jobId);

        // Email seeker confirmation
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

        if (!status.equals(previousStatus)) {
            User seeker = userRepository.findById(app.getSeekerId()).orElse(null);
            if (seeker != null) {
                switch (status) {
                    case "SHORTLISTED" -> {
                        emailService.sendShortlistEmail(
                            seeker.getEmail(), seeker.getName(),
                            app.getJobTitle(), app.getCompanyName()
                        );
                        // Notify seeker
                        notificationService.create(seeker.getId(),
                            "⭐ You've been Shortlisted!",
                            "Congratulations! You've been shortlisted for " + app.getJobTitle() + " at " + app.getCompanyName() + ". Interview may be scheduled soon.",
                            "SHORTLIST", "/seeker/applications");
                        // Notify employer
                        Job job = jobRepository.findById(app.getJobId()).orElse(null);
                        if (job != null) {
                            notificationService.create(job.getEmployerId(),
                                "✅ " + seeker.getName() + " Shortlisted",
                                "You shortlisted " + seeker.getName() + " for " + app.getJobTitle() + ". Schedule interview next.",
                                "SHORTLIST", "/employer/applications/" + app.getJobId());
                        }
                    }
                    case "INTERVIEW_SCHEDULED" -> {
                        // Notify seeker
                        notificationService.create(seeker.getId(),
                            "📅 Interview Scheduled!",
                            "Your interview for " + app.getJobTitle() + " at " + app.getCompanyName() + " has been scheduled. Check My Interviews for details.",
                            "INTERVIEW", "/seeker/interviews");
                        // Notify employer
                        Job jobI = jobRepository.findById(app.getJobId()).orElse(null);
                        if (jobI != null) {
                            notificationService.create(jobI.getEmployerId(),
                                "📅 Interview Scheduled for " + seeker.getName(),
                                "Interview scheduled with " + seeker.getName() + " for " + app.getJobTitle() + ".",
                                "INTERVIEW", "/employer/interviews");
                        }
                    }
                    case "OFFERED" -> {
                        // Notify seeker — NO email yet, sent only when accepted
                        notificationService.create(seeker.getId(),
                            "🎉 Job Offer Received!",
                            "You have received an offer for " + app.getJobTitle() + " at " + app.getCompanyName() + ". Please accept or decline.",
                            "OFFER", "/seeker/offers");
                        // Notify employer
                        Job job = jobRepository.findById(app.getJobId()).orElse(null);
                        if (job != null) {
                            notificationService.create(job.getEmployerId(),
                                "📨 Offer Sent to " + seeker.getName(),
                                "Your offer for " + app.getJobTitle() + " has been sent to " + seeker.getName() + ". Waiting for response.",
                                "OFFER", "/employer/applications/" + app.getJobId());
                        }
                    }
                    case "ACCEPTED" -> {
                        Job job = jobRepository.findById(app.getJobId()).orElse(null);
                        User employer = job != null
                            ? userRepository.findById(job.getEmployerId()).orElse(null) : null;
                        // Send offer letter email NOW
                        emailService.sendOfferLetterEmail(
                            seeker.getEmail(), seeker.getName(),
                            app.getJobTitle(), app.getCompanyName(),
                            employer != null ? employer.getCompanyWebsite() : "",
                            employer != null ? employer.getName() : app.getCompanyName(),
                            job != null ? job.getMinSalary() : 0,
                            job != null ? job.getMaxSalary() : 0,
                            job != null ? job.getJobType() : "FULL_TIME",
                            job != null && job.isRemote(),
                            employerNote
                        );
                        // Notify seeker
                        notificationService.create(seeker.getId(),
                            "✅ Offer Accepted!",
                            "You accepted the offer for " + app.getJobTitle() + " at " + app.getCompanyName() + ". Congratulations!",
                            "OFFER", "/seeker/offers");
                        // Notify employer
                        if (job != null) {
                            notificationService.create(job.getEmployerId(),
                                "🎉 " + seeker.getName() + " Accepted the Offer!",
                                seeker.getName() + " accepted your offer for " + app.getJobTitle() + ". Congratulations on your new hire!",
                                "OFFER", "/employer/applications/" + app.getJobId());
                        }
                    }
                    case "REJECTED" -> {
                        // Notify employer when seeker declines
                        Job job = jobRepository.findById(app.getJobId()).orElse(null);
                        if (job != null) {
                            notificationService.create(job.getEmployerId(),
                                "❌ " + seeker.getName() + " Declined the Offer",
                                seeker.getName() + " declined your offer for " + app.getJobTitle() + ".",
                                "OFFER", "/employer/applications/" + app.getJobId());
                        }
                        // Notify seeker their rejection was recorded
                        notificationService.create(seeker.getId(),
                            "❌ Offer Declined",
                            "You have declined the offer for " + app.getJobTitle() + " at " + app.getCompanyName() + ".",
                            "OFFER", "/seeker/offers");
                    }
                    default -> log.info("Status: {} — no trigger", status);
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
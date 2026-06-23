package com.skillbridge.service;

import com.skillbridge.model.Job;
import com.skillbridge.model.JobAlert;
import com.skillbridge.model.User;
import com.skillbridge.repository.JobAlertRepository;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobScheduledTasks {

    private final JobRepository jobRepository;
    private final JobAlertRepository jobAlertRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Runs once an hour. Closes any job still marked OPEN whose deadline has passed —
    // previously the deadline field was just decorative and jobs stayed open forever.
    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void closeExpiredJobs() {
        List<Job> openJobs = jobRepository.findByStatus("OPEN");
        LocalDateTime now = LocalDateTime.now();
        int closedCount = 0;
        for (Job job : openJobs) {
            if (job.getDeadline() != null && job.getDeadline().isBefore(now)) {
                job.setStatus("CLOSED");
                jobRepository.save(job);
                closedCount++;
            }
        }
        if (closedCount > 0) {
            log.info("⏰ Auto-closed {} job(s) past their application deadline.", closedCount);
        }
    }

    // Runs every 6 hours. Checks each saved job alert against jobs posted since that
    // alert's last notification, and emails the seeker if anything new matches.
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000)
    public void checkJobAlerts() {
        List<JobAlert> alerts = jobAlertRepository.findAll();
        if (alerts.isEmpty()) return;

        List<Job> openJobs = jobRepository.findByStatus("OPEN");
        int emailsSent = 0;

        for (JobAlert alert : alerts) {
            LocalDateTime since = alert.getLastNotifiedAt() != null ? alert.getLastNotifiedAt() : alert.getCreatedAt();
            List<Job> matches = new ArrayList<>();
            for (Job job : openJobs) {
                if (job.getPostedAt() == null || !job.getPostedAt().isAfter(since)) continue;
                if (alert.getKeyword() != null && !alert.getKeyword().isBlank()) {
                    String kw = alert.getKeyword().toLowerCase();
                    boolean titleMatches = job.getTitle() != null && job.getTitle().toLowerCase().contains(kw);
                    boolean descMatches = job.getDescription() != null && job.getDescription().toLowerCase().contains(kw);
                    if (!titleMatches && !descMatches) continue;
                }
                if (alert.getRemote() != null && !alert.getRemote().equals(job.isRemote())) continue;
                if (alert.getExperienceLevel() != null && !alert.getExperienceLevel().isBlank()
                    && !alert.getExperienceLevel().equals(job.getExperienceLevel())) continue;
                matches.add(job);
            }

            if (!matches.isEmpty()) {
                User user = userRepository.findById(alert.getUserId()).orElse(null);
                if (user != null) {
                    try {
                        emailService.sendJobAlertEmail(user.getEmail(), user.getName(), matches);
                        emailsSent++;
                    } catch (Exception e) {
                        log.error("Failed to send job alert email to {}: {}", user.getEmail(), e.getMessage());
                    }
                }
            }
            alert.setLastNotifiedAt(LocalDateTime.now());
            jobAlertRepository.save(alert);
        }

        if (emailsSent > 0) {
            log.info("🔔 Sent {} job alert email(s).", emailsSent);
        }
    }
}
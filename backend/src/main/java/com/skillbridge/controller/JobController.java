package com.skillbridge.controller;

import com.skillbridge.model.Application;
import com.skillbridge.model.Job;
import com.skillbridge.model.User;
import com.skillbridge.repository.ApplicationRepository;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.JobService;
import com.skillbridge.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@Slf4j
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    @GetMapping("/all")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllOpenJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) Boolean remote,
            @RequestParam(required = false) String experienceLevel) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, minSalary, maxSalary, remote, experienceLevel));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> createJob(@RequestBody Job job, Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(jobService.createJob(job, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Job>> getMyJobs(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Job> jobs = jobService.getJobsByEmployer(user.getId());
        // Ensure companyName is always set from employer profile
        String companyName = user.getCompanyName() != null && !user.getCompanyName().isEmpty()
            ? user.getCompanyName() : user.getName();
        jobs.forEach(j -> {
            if (j.getCompanyName() == null || j.getCompanyName().isEmpty()) {
                j.setCompanyName(companyName);
            }
        });
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateJob(@PathVariable String id, @RequestBody Job job) {
        try {
            return ResponseEntity.ok(jobService.updateJob(id, job));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok("Job deleted successfully");
    }

    // ─── Quick Status Toggle ───
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleStatus(@PathVariable String id,
                                           @RequestBody java.util.Map<String, String> body) {
        try {
            Job job = jobService.getJobById(id);
            String prevStatus = job.getStatus();
            String newStatus = body.get("status");
            job.setStatus(newStatus);
            Job saved = jobRepository.save(job);

            // Notify all seekers who applied when job is PAUSED or CLOSED
            if (("PAUSED".equals(newStatus) || "CLOSED".equals(newStatus)) && !newStatus.equals(prevStatus)) {
                List<Application> applications = applicationRepository.findByJobId(id);
                for (Application app : applications) {
                    if (app.getSeekerId() != null &&
                        !List.of("REJECTED","ACCEPTED","OFFERED").contains(app.getStatus())) {
                        try {
                            String msg = "PAUSED".equals(newStatus)
                                ? "The job posting for " + job.getTitle() + " at " + job.getCompanyName() + " has been temporarily paused by the employer."
                                : "The job posting for " + job.getTitle() + " at " + job.getCompanyName() + " has been closed.";
                            notificationService.create(app.getSeekerId(),
                                "PAUSED".equals(newStatus) ? "⏸️ Job Paused — " + job.getTitle() : "🔒 Job Closed — " + job.getTitle(),
                                msg,
                                "SYSTEM", "/seeker/applications");
                        } catch (Exception e) {
                            log.warn("Could not notify seeker {} of job status change", app.getSeekerId());
                        }
                    }
                }
                log.info("Notified {} seekers of job {} status change to {}", applications.size(), id, newStatus);
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/match-score/{jobId}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> getMatchScore(@PathVariable String jobId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        int score = jobService.calculateSkillMatchScore(user.getId(), jobId);
        return ResponseEntity.ok(java.util.Map.of("score", score));
    }
}

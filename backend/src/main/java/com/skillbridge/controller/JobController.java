package com.skillbridge.controller;

import com.skillbridge.model.Job;
import com.skillbridge.model.User;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final com.skillbridge.repository.JobRepository jobRepository;
    private final UserRepository userRepository;

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
        return ResponseEntity.ok(jobService.getJobsByEmployer(user.getId()));
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
            job.setStatus(body.get("status"));
            return ResponseEntity.ok(jobRepository.save(job));
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

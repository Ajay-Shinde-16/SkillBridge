package com.skillbridge.controller;

import com.skillbridge.model.Application;
import com.skillbridge.model.User;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> apply(@PathVariable String jobId,
                                   @RequestBody Map<String, String> body,
                                   Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            String coverLetter = body.getOrDefault("coverLetter", "");
            return ResponseEntity.ok(applicationService.applyToJob(user.getId(), jobId, coverLetter));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<List<Application>> myApplications(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getSeekerApplications(user.getId()));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<List<Application>> jobApplications(@PathVariable String jobId) {
        return ResponseEntity.ok(applicationService.getJobApplications(jobId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                          @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            String note = body.get("employerNote");
            return ResponseEntity.ok(applicationService.updateStatus(id, status, note));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Application>> allApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }
}

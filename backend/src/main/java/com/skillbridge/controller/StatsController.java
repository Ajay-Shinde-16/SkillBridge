package com.skillbridge.controller;

import com.skillbridge.repository.UserRepository;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public, read-only platform statistics used by the landing page.
 * Returns live counts from the database so the homepage numbers are real
 * rather than hardcoded.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StatsController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        long seekers   = userRepository.countByRole("SEEKER");
        long employers = userRepository.countByRole("EMPLOYER");
        // "Jobs" on the landing page = jobs that are actually live (open + admin-verified).
        long openJobs  = jobRepository.countByStatusAndVerified("OPEN", true);
        long verifiedSkills = skillRepository.countByVerified(true);

        return ResponseEntity.ok(Map.of(
            "seekers", seekers,
            "employers", employers,
            "jobs", openJobs,
            "verifiedSkills", verifiedSkills
        ));
    }
}
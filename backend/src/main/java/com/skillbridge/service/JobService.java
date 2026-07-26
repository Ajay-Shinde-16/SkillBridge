package com.skillbridge.service;

import com.skillbridge.model.Job;
import com.skillbridge.model.User;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Job createJob(Job job, String employerId) {
        User employer = userRepository.findById(employerId)
            .orElseThrow(() -> new RuntimeException("Employer not found"));
        job.setEmployerId(employerId);
        job.setCompanyName(employer.getCompanyName() != null ? employer.getCompanyName() : employer.getName());
        job.setStatus("OPEN");
        job.setPostedAt(LocalDateTime.now());
        job.setApplicationCount(0);
        return jobRepository.save(job);
    }

    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus("OPEN");
    }

    public List<Job> getJobsByEmployer(String employerId) {
        return jobRepository.findByEmployerId(employerId);
    }

    public Job getJobById(String id) {
        return jobRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public Job updateJob(String id, Job updatedJob) {
        Job job = getJobById(id);
        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setRequiredSkills(updatedJob.getRequiredSkills());
        job.setMinSalary(updatedJob.getMinSalary());
        job.setMaxSalary(updatedJob.getMaxSalary());
        job.setRemote(updatedJob.isRemote());
        job.setJobType(updatedJob.getJobType());
        job.setExperienceLevel(updatedJob.getExperienceLevel());
        job.setStatus(updatedJob.getStatus());
        job.setDeadline(updatedJob.getDeadline());
        return jobRepository.save(job);
    }

    public void deleteJob(String id) {
        jobRepository.deleteById(id);
    }

    public List<Job> searchJobs(String keyword, Double minSalary, Double maxSalary,
                                 Boolean remote, String experienceLevel) {
        List<Job> jobs = jobRepository.findByStatus("OPEN");
        return jobs.stream()
            .filter(j -> keyword == null || j.getTitle().toLowerCase().contains(keyword.toLowerCase())
                || j.getDescription().toLowerCase().contains(keyword.toLowerCase()))
            .filter(j -> minSalary == null || j.getMaxSalary() >= minSalary)
            .filter(j -> maxSalary == null || j.getMinSalary() <= maxSalary)
            .filter(j -> remote == null || j.isRemote() == remote)
            .filter(j -> experienceLevel == null || experienceLevel.equals(j.getExperienceLevel()))
            .collect(Collectors.toList());
    }

    // Calculate skill match score between seeker and job
    public int calculateSkillMatchScore(String seekerId, String jobId) {
        User seeker = userRepository.findById(seekerId)
            .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Job job = getJobById(jobId);

        if (job.getRequiredSkills() == null || job.getRequiredSkills().isEmpty()) return 100;
        if (seeker.getSkills() == null || seeker.getSkills().isEmpty()) return 0;

        List<String> seekerSkillsLower = seeker.getSkills().stream()
            .map(String::toLowerCase).collect(Collectors.toList());
        List<String> verifiedSkillsLower = seeker.getVerifiedSkills() != null
            ? seeker.getVerifiedSkills().stream().map(String::toLowerCase).collect(Collectors.toList())
            : List.of();

        long matched = job.getRequiredSkills().stream()
            .map(String::toLowerCase)
            .filter(seekerSkillsLower::contains)
            .count();

        long verifiedMatched = job.getRequiredSkills().stream()
            .map(String::toLowerCase)
            .filter(verifiedSkillsLower::contains)
            .count();

        // Verified skills count 1.5x
        double score = (matched + verifiedMatched * 0.5) / job.getRequiredSkills().size() * 100;
        return (int) Math.min(score, 100);
    }

    public void incrementApplicationCount(String jobId) {
        Job job = getJobById(jobId);
        job.setApplicationCount(job.getApplicationCount() + 1);
        jobRepository.save(job);
    }
}

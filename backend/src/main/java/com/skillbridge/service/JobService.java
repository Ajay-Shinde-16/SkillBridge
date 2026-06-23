package com.skillbridge.service;

import com.skillbridge.model.Job;
import com.skillbridge.model.User;
import com.skillbridge.repository.JobRepository;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Job createJob(Job job, String employerId) {
        User employer = userRepository.findById(employerId)
            .orElseThrow(() -> new RuntimeException("Employer not found"));

        job.setEmployerId(employerId);
        job.setCompanyName(
            employer.getCompanyName() != null && !employer.getCompanyName().isEmpty()
                ? employer.getCompanyName()
                : employer.getName()
        );
        job.setStatus("OPEN");
        job.setPostedAt(LocalDateTime.now());
        job.setApplicationCount(0);

        // Clean requiredSkills — remove any JSON array brackets/quotes
        if (job.getRequiredSkills() != null) {
            String cleaned = job.getRequiredSkills()
                .replace("[", "").replace("]", "").replace("\"", "").trim();
            job.setRequiredSkills(cleaned);
        }

        log.info("Creating job: {} for employer: {}", job.getTitle(), employer.getName());
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
            .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    public Job updateJob(String id, Job updatedJob, String requestingUserId, boolean isAdmin) {
        Job job = getJobById(id);
        if (!isAdmin && (job.getEmployerId() == null || !job.getEmployerId().equals(requestingUserId))) {
            throw new RuntimeException("You are not authorized to edit this job posting.");
        }
        if (updatedJob.getTitle() != null) job.setTitle(updatedJob.getTitle());
        if (updatedJob.getDescription() != null) job.setDescription(updatedJob.getDescription());
        if (updatedJob.getRequiredSkills() != null) {
            String cleaned = updatedJob.getRequiredSkills()
                .replace("[", "").replace("]", "").replace("\"", "").trim();
            job.setRequiredSkills(cleaned);
        }
        job.setMinSalary(updatedJob.getMinSalary());
        job.setMaxSalary(updatedJob.getMaxSalary());
        job.setRemote(updatedJob.isRemote());
        if (updatedJob.getJobType() != null) job.setJobType(updatedJob.getJobType());
        if (updatedJob.getExperienceLevel() != null) job.setExperienceLevel(updatedJob.getExperienceLevel());
        if (updatedJob.getStatus() != null) job.setStatus(updatedJob.getStatus());
        if (updatedJob.getDeadline() != null) job.setDeadline(updatedJob.getDeadline());
        if (updatedJob.getLocation() != null) job.setLocation(updatedJob.getLocation());
        return jobRepository.save(job);
    }

    public void deleteJob(String id, String requestingUserId, boolean isAdmin) {
        Job job = getJobById(id);
        if (!isAdmin && (job.getEmployerId() == null || !job.getEmployerId().equals(requestingUserId))) {
            throw new RuntimeException("You are not authorized to delete this job posting.");
        }
        jobRepository.deleteById(id);
    }

    public List<Job> searchJobs(String keyword, Double minSalary, Double maxSalary,
                                 Boolean remote, String experienceLevel) {
        return jobRepository.searchJobs(keyword, remote, experienceLevel, minSalary, maxSalary);
    }

    public org.springframework.data.domain.Page<Job> searchJobsPaged(
            String keyword, Double minSalary, Double maxSalary,
            Boolean remote, String experienceLevel, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, size,
            org.springframework.data.domain.Sort.by("postedAt").descending()
        );
        return jobRepository.searchJobsPaged(keyword, remote, experienceLevel, minSalary, maxSalary, pageable);
    }

    public int calculateSkillMatchScore(String seekerId, String jobId) {
        User seeker = userRepository.findById(seekerId)
            .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Job job = getJobById(jobId);

        // Get required skills list from job
        List<String> required = job.getRequiredSkillsList();
        if (required == null || required.isEmpty()) return 100;

        // ─── FIX: explicitly cast to String list ───
        List<String> seekerRaw = seeker.getSkillsList();
        List<String> verifiedRaw = seeker.getVerifiedSkillsList();

        List<String> seekerSkills = new ArrayList<>();
        if (seekerRaw != null) {
            for (Object o : seekerRaw) {
                if (o != null) seekerSkills.add(o.toString().toLowerCase().trim());
            }
        }

        List<String> verifiedSkills = new ArrayList<>();
        if (verifiedRaw != null) {
            for (Object o : verifiedRaw) {
                if (o != null) verifiedSkills.add(o.toString().toLowerCase().trim());
            }
        }

        long matched = 0;
        long verifiedMatched = 0;
        for (String req : required) {
            String reqLower = req.toLowerCase().trim();
            if (seekerSkills.contains(reqLower)) matched++;
            if (verifiedSkills.contains(reqLower)) verifiedMatched++;
        }

        double score = (matched + verifiedMatched * 0.5) / required.size() * 100;
        return (int) Math.min(score, 100);
    }

    public void incrementApplicationCount(String jobId) {
        Job job = getJobById(jobId);
        job.setApplicationCount(job.getApplicationCount() + 1);
        jobRepository.save(job);
    }
}
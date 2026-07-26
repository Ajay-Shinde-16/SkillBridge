package com.skillbridge.repository;

import com.skillbridge.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByEmployerId(String employerId);
    List<Job> findByStatus(String status);
    List<Job> findByStatusAndRemote(String status, boolean remote);
    List<Job> findByTitleContainingIgnoreCaseAndStatus(String title, String status);
    List<Job> findByRequiredSkillsInAndStatus(List<String> skills, String status);
    List<Job> findByMinSalaryGreaterThanEqualAndMaxSalaryLessThanEqualAndStatus(
        double minSalary, double maxSalary, String status);
}

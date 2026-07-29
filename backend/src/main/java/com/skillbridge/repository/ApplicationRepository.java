package com.skillbridge.repository;

import com.skillbridge.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findBySeekerId(String seekerId);
    List<Application> findByJobId(String jobId);
    Optional<Application> findBySeekerIdAndJobId(String seekerId, String jobId);
    List<Application> findByStatus(String status);
    long countByJobId(String jobId);
}

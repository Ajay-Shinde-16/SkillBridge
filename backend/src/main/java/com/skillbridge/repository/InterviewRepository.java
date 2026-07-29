package com.skillbridge.repository;

import com.skillbridge.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InterviewRepository extends MongoRepository<Interview, String> {
    List<Interview> findBySeekerId(String seekerId);
    List<Interview> findByEmployerId(String employerId);
    List<Interview> findByApplicationId(String applicationId);
    List<Interview> findByStatus(String status);
}

package com.skillbridge.repository;

import com.skillbridge.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, String> {
    List<Job> findByEmployerId(String employerId);
    List<Job> findByStatus(String status);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:remote IS NULL OR j.remote = :remote) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) AND " +
           "(:minSalary IS NULL OR j.maxSalary >= :minSalary) AND " +
           "(:maxSalary IS NULL OR j.minSalary <= :maxSalary)")
    List<Job> searchJobs(@Param("keyword") String keyword,
                         @Param("remote") Boolean remote,
                         @Param("experienceLevel") String experienceLevel,
                         @Param("minSalary") Double minSalary,
                         @Param("maxSalary") Double maxSalary);
}

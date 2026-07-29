package com.skillbridge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applications")
public class Application {

    @Id
    private String id;

    private String jobId;

    private String seekerId;

    private String seekerName;

    private String seekerEmail;

    private String jobTitle;

    private String companyName;

    private String status; // APPLIED, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED, ACCEPTED

    private int skillMatchScore; // percentage match

    private String coverLetter;

    private String resumeUrl;

    private String employerNote;

    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;
}

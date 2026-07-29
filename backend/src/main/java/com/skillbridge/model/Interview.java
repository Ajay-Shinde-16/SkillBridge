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
@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    private String applicationId;

    private String jobId;

    private String seekerId;

    private String employerId;

    private String seekerName;

    private String jobTitle;

    private LocalDateTime scheduledDateTime;

    private String mode; // VIDEO, PHONE, IN_PERSON

    private String meetingLink;

    private String venue;

    private String status; // SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED

    private String feedback;

    private String result; // PASS, FAIL, PENDING

    private LocalDateTime createdAt;
}

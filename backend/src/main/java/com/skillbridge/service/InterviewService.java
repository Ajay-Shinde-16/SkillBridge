package com.skillbridge.service;

import com.skillbridge.model.Application;
import com.skillbridge.model.Interview;
import com.skillbridge.model.User;
import com.skillbridge.repository.InterviewRepository;
import com.skillbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.skillbridge.service.NotificationService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationService applicationService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public Interview scheduleInterview(Interview interview) {
        Application app = applicationService.getById(interview.getApplicationId());
        interview.setSeekerId(app.getSeekerId());
        interview.setSeekerName(app.getSeekerName());
        interview.setJobId(app.getJobId());
        interview.setJobTitle(app.getJobTitle());
        interview.setStatus("SCHEDULED");
        interview.setResult("PENDING");
        interview.setCreatedAt(LocalDateTime.now());

        // Auto update application status
        applicationService.updateStatus(interview.getApplicationId(), "INTERVIEW_SCHEDULED", null);

        Interview saved = interviewRepository.save(interview);

        // Send interview email to seeker
        User seeker = userRepository.findById(app.getSeekerId()).orElse(null);
        if (seeker != null) {
            String formattedDateTime = interview.getScheduledDateTime() != null
                ? interview.getScheduledDateTime()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "To be confirmed";

            emailService.sendInterviewScheduledEmail(
                seeker.getEmail(),
                seeker.getName(),
                app.getJobTitle(),
                app.getCompanyName(),
                formattedDateTime,
                interview.getMode(),
                interview.getMeetingLink(),
                interview.getVenue()
            );
        }

        // Send in-app notification
        if (seeker != null) {
            notificationService.create(seeker.getId(),
                "🎯 Interview Scheduled!",
                "Your interview for " + app.getJobTitle() + " at " + app.getCompanyName() + " has been scheduled.",
                "INTERVIEW", "/seeker/interviews");
        }
        return saved;
    }

    public List<Interview> getSeekerInterviews(String seekerId) {
        return interviewRepository.findBySeekerId(seekerId);
    }

    public List<Interview> getEmployerInterviews(String employerId) {
        return interviewRepository.findByEmployerId(employerId);
    }

    // Seeker marks interview as completed (joined meeting)
    public Interview markCompleted(String id, String seekerId) {
        Interview interview = interviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Interview not found"));

        // Verify this seeker owns the interview
        if (!interview.getSeekerId().equals(seekerId))
            throw new RuntimeException("Not authorized");

        // Mark interview as completed
        interview.setStatus("COMPLETED");
        Interview saved = interviewRepository.save(interview);

        // Update application status to INTERVIEW_COMPLETED
        applicationService.updateStatus(interview.getApplicationId(), "INTERVIEW_COMPLETED", null);

        // Notify employer that seeker attended
        User seeker = userRepository.findById(seekerId).orElse(null);
        if (seeker != null && interview.getEmployerId() != null) {
            notificationService.create(interview.getEmployerId(),
                "✅ " + seeker.getName() + " Attended the Interview!",
                seeker.getName() + " has joined and completed the interview for " + interview.getJobTitle() + ". You can now send the offer letter!",
                "INTERVIEW", "/employer/applications/" + interview.getJobId());
        }

        // Notify seeker confirmation
        if (seeker != null) {
            notificationService.create(seekerId,
                "✅ Interview Completed!",
                "Your interview for " + interview.getJobTitle() + " is marked as completed. Wait for employer's decision.",
                "INTERVIEW", "/seeker/interviews");
        }

        return saved;
    }

    public Interview updateInterview(String id, String status, String feedback, String result) {
        Interview interview = interviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        if (status != null) interview.setStatus(status);
        if (feedback != null) interview.setFeedback(feedback);
        if (result != null) interview.setResult(result);
        return interviewRepository.save(interview);
    }

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }
}
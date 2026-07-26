package com.skillbridge.service;

import com.skillbridge.model.Application;
import com.skillbridge.model.Interview;
import com.skillbridge.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationService applicationService;

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

        return interviewRepository.save(interview);
    }

    public List<Interview> getSeekerInterviews(String seekerId) {
        return interviewRepository.findBySeekerId(seekerId);
    }

    public List<Interview> getEmployerInterviews(String employerId) {
        return interviewRepository.findByEmployerId(employerId);
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

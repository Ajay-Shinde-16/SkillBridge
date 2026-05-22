package com.skillbridge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfService pdfService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    // ─── 1. Application Confirmation ───
    @Async
    public void sendApplicationConfirmationEmail(String toEmail, String seekerName,
                                                  String jobTitle, String companyName, int matchScore) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(toEmail);
            h.setSubject("✅ Application Submitted — " + jobTitle + " at " + companyName);
            h.setText(buildApplicationHtml(seekerName, jobTitle, companyName, matchScore), true);
            mailSender.send(msg);
            log.info("✅ Application confirmation email sent to: {}", toEmail);
        } catch (Exception e) { log.error("Email failed: {}", e.getMessage()); }
    }

    // ─── 2. Shortlist Email ───
    @Async
    public void sendShortlistEmail(String toEmail, String seekerName,
                                    String jobTitle, String companyName) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(toEmail);
            h.setSubject("⭐ You've been Shortlisted! — " + jobTitle + " at " + companyName);
            h.setText(buildShortlistHtml(seekerName, jobTitle, companyName), true);
            mailSender.send(msg);
            log.info("⭐ Shortlist email sent to: {}", toEmail);
        } catch (Exception e) { log.error("Email failed: {}", e.getMessage()); }
    }

    // ─── 3. Interview Scheduled Email ───
    @Async
    public void sendInterviewScheduledEmail(String toEmail, String seekerName,
                                             String jobTitle, String companyName,
                                             String scheduledDateTime, String mode,
                                             String meetingLink, String venue) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(toEmail);
            h.setSubject("🎯 Interview Scheduled — " + jobTitle + " at " + companyName);
            h.setText(buildInterviewHtml(seekerName, jobTitle, companyName,
                    scheduledDateTime, mode, meetingLink, venue), true);
            mailSender.send(msg);
            log.info("🎯 Interview email sent to: {}", toEmail);
        } catch (Exception e) { log.error("Email failed: {}", e.getMessage()); }
    }

    // ─── 4. Offer Letter Email WITH PDF Attachment ───
    @Async
    public void sendOfferLetterEmail(String toEmail, String seekerName,
                                      String jobTitle, String companyName,
                                      String companyWebsite, String employerName,
                                      double minSalary, double maxSalary,
                                      String jobType, boolean remote,
                                      String employerNote) {
        try {
            // Generate PDF offer letter
            byte[] pdfBytes = pdfService.generateOfferLetter(
                    seekerName, toEmail, jobTitle, companyName,
                    companyWebsite, employerName,
                    minSalary, maxSalary, jobType, remote, employerNote
            );

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(toEmail);
            h.setSubject("🎉 Job Offer Letter — " + jobTitle + " at " + companyName);
            h.setText(buildOfferHtml(seekerName, jobTitle, companyName, employerNote), true);

            // Attach PDF only if it was generated successfully
            if (pdfBytes != null && pdfBytes.length > 0) {
                String fileName = "Offer_Letter_" + seekerName.replace(" ", "_") + "_" + companyName.replace(" ", "_") + ".pdf";
                h.addAttachment(fileName, new ByteArrayDataSource(pdfBytes, "application/pdf"));
                log.info("📎 PDF offer letter attached: {}", fileName);
            }

            mailSender.send(msg);
            log.info("🎉 Offer letter email sent to: {}", toEmail);
        } catch (Exception e) { log.error("Offer email failed: {}", e.getMessage()); }
    }

    // ─── OTP Email for Forgot Password ───
    @Async
    public void sendOtpEmail(String toEmail, String name, String otp) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(toEmail);
            h.setSubject("🔑 Password Reset OTP — SkillBridge");
            h.setText(buildOtpHtml(name, otp), true);
            mailSender.send(msg);
            log.info("🔑 OTP email sent to: {}", toEmail);
        } catch (Exception e) { log.error("OTP email failed: {}", e.getMessage()); }
    }

    // ─── HTML Templates ───

    private String buildApplicationHtml(String name, String job, String company, int score) {
        String scoreColor = score >= 70 ? "#057642" : score >= 40 ? "#d97706" : "#dc3545";
        return template(
            "#0A66C2",
            "✅ Application Submitted!",
            "SkillBridge — Remote Job Portal",
            name,
            "Your application has been successfully submitted. Here's a summary:",
            "<div style='background:#EEF3F8;border-radius:10px;padding:20px;margin:16px 0;border-left:4px solid #0A66C2'>" +
            "<p style='margin:6px 0'><strong>Company:</strong> " + company + "</p>" +
            "<p style='margin:6px 0'><strong>Position:</strong> " + job + "</p>" +
            "<p style='margin:6px 0'><strong>Your Skill Match:</strong> <span style='color:" + scoreColor + ";font-size:20px;font-weight:700'>" + score + "%</span></p>" +
            "</div>" +
            "<p style='color:#666'>The employer will review your application and get back to you. Keep an eye on your SkillBridge dashboard for updates.</p>",
            "/seeker/applications",
            "Track Your Application",
            "#0A66C2"
        );
    }

    private String buildShortlistHtml(String name, String job, String company) {
        return template(
            "#0ea5e9",
            "⭐ You've been Shortlisted!",
            "SkillBridge — Remote Job Portal",
            name,
            "Excellent news! You have been shortlisted for the following position:",
            "<div style='background:#E0F2FE;border-radius:10px;padding:20px;margin:16px 0;border-left:4px solid #0ea5e9'>" +
            "<p style='margin:6px 0'><strong>Company:</strong> " + company + "</p>" +
            "<p style='margin:6px 0'><strong>Position:</strong> " + job + "</p>" +
            "<p style='margin:6px 0'><strong>Status:</strong> <span style='color:#0ea5e9;font-weight:700'>Shortlisted ⭐</span></p>" +
            "</div>" +
            "<p style='color:#666'>The employer will be scheduling an interview with you shortly. Please ensure your profile and resume are up to date.</p>",
            "/seeker/applications",
            "View Application Status",
            "#0ea5e9"
        );
    }

    private String buildInterviewHtml(String name, String job, String company,
                                       String dateTime, String mode, String link, String venue) {
        String meetingSection = "";
        if (link != null && !link.isEmpty())
            meetingSection += "<p style='margin:6px 0'><strong>Meeting Link:</strong> <a href='" + link + "' style='color:#0A66C2'>" + link + "</a></p>";
        if (venue != null && !venue.isEmpty())
            meetingSection += "<p style='margin:6px 0'><strong>Venue:</strong> " + venue + "</p>";

        return template(
            "#0A66C2",
            "🎯 Interview Scheduled!",
            "SkillBridge — Remote Job Portal",
            name,
            "Your interview has been scheduled. Please find the details below:",
            "<div style='background:#EEF3F8;border-radius:10px;padding:20px;margin:16px 0;border-left:4px solid #0A66C2'>" +
            "<p style='margin:6px 0'><strong>Company:</strong> " + company + "</p>" +
            "<p style='margin:6px 0'><strong>Position:</strong> " + job + "</p>" +
            "<p style='margin:6px 0'><strong>Date & Time:</strong> <span style='color:#0A66C2;font-weight:700'>" + dateTime + "</span></p>" +
            "<p style='margin:6px 0'><strong>Mode:</strong> " + mode + "</p>" +
            meetingSection +
            "</div>" +
            "<div style='background:#FEF3C7;border-radius:8px;padding:14px;margin:12px 0;border:1px solid #FCD34D'>" +
            "<strong style='color:#92400e'>⚠ Reminder:</strong> <span style='color:#92400e'>Please be available 5 minutes before the scheduled time. Keep your resume and ID proof ready.</span>" +
            "</div>",
            "/seeker/interviews",
            "View Interview Details",
            "#0A66C2"
        );
    }

    private String buildOfferHtml(String name, String job, String company, String note) {
        String noteSection = (note != null && !note.isEmpty())
            ? "<div style='background:#EEF3F8;border-radius:8px;padding:14px;margin:12px 0'>" +
              "<strong style='color:#0A66C2'>Message from Employer:</strong><br><em style='color:#333'>" + note + "</em></div>"
            : "";

        return template(
            "#057642",
            "🎉 Congratulations! Job Offer",
            "SkillBridge — Remote Job Portal",
            name,
            "We are thrilled to inform you that you have been SELECTED for the following position!",
            "<div style='background:#D1FAE5;border-radius:10px;padding:20px;margin:16px 0;border-left:4px solid #057642'>" +
            "<p style='margin:6px 0'><strong>Company:</strong> " + company + "</p>" +
            "<p style='margin:6px 0'><strong>Position:</strong> <span style='color:#057642;font-weight:700;font-size:16px'>" + job + "</span></p>" +
            "<p style='margin:6px 0'><strong>Status:</strong> Offer Extended 🏆</p>" +
            "</div>" +
            noteSection +
            "<div style='background:#FEF3C7;border-radius:8px;padding:14px;margin:12px 0;border:1px solid #FCD34D'>" +
            "<strong style='color:#92400e'>📎 Offer Letter PDF</strong><br>" +
            "<span style='color:#92400e'>Your official offer letter is attached to this email as a PDF. Please download and keep it for your records.</span>" +
            "</div>" +
            "<p style='color:#666'>Please login to SkillBridge and go to <strong>My Offers</strong> to <strong>Accept</strong> or <strong>Decline</strong> this offer within 3 business days.</p>",
            "/seeker/offers",
            "View & Respond to Offer",
            "#057642"
        );
    }

    private String buildOtpHtml(String name, String otp) {
        return "<!DOCTYPE html><html><body style='margin:0;padding:20px;background:#f3f2ef;font-family:Arial,sans-serif'>" +
            "<div style='max-width:500px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)'>" +
            "<div style='background:#0A66C2;padding:24px;text-align:center'>" +
            "<h2 style='color:#fff;margin:0'>🔑 Password Reset OTP</h2>" +
            "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px'>SkillBridge — Remote Job Portal</p></div>" +
            "<div style='padding:28px'>" +
            "<p style='font-size:15px'>Dear <strong>" + name + "</strong>,</p>" +
            "<p style='color:#444'>You requested a password reset. Use the OTP below:</p>" +
            "<div style='text-align:center;margin:24px 0'>" +
            "<div style='display:inline-block;background:#EEF3F8;border:2px dashed #0A66C2;border-radius:12px;padding:20px 40px'>" +
            "<div style='font-size:36px;font-weight:700;letter-spacing:8px;color:#0A66C2'>" + otp + "</div>" +
            "<div style='color:#666;font-size:12px;margin-top:8px'>Valid for 10 minutes only</div></div></div>" +
            "<div style='background:#FEF3C7;border-radius:8px;padding:12px;border:1px solid #FCD34D'>" +
            "<strong style='color:#92400e'>⚠ Security Warning:</strong> " +
            "<span style='color:#92400e'>Never share this OTP with anyone. SkillBridge will never ask for your OTP.</span></div>" +
            "<p style='color:#666;margin-top:16px;font-size:13px'>If you did not request this, please ignore this email. Your account is safe.</p>" +
            "<p style='color:#0A66C2;font-weight:bold'>Team SkillBridge</p></div>" +
            "<div style='background:#f8f9fa;padding:12px;text-align:center;border-top:1px solid #e2e8f0'>" +
            "<p style='margin:0;color:#999;font-size:11px'>SkillBridge — CDAC PGCP-AC-002</p></div></div></body></html>";
    }

    // ─── Master HTML Template ───
    private String template(String headerColor, String heading, String subheading,
                             String name, String intro, String content,
                             String ctaPath, String ctaLabel, String ctaColor) {
        return "<!DOCTYPE html><html><body style='margin:0;padding:20px;background:#f3f2ef;font-family:Arial,sans-serif'>" +
            "<div style='max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)'>" +
            "<div style='background:" + headerColor + ";padding:28px 32px;text-align:center'>" +
            "<h2 style='color:#fff;margin:0 0 6px;font-size:22px'>" + heading + "</h2>" +
            "<p style='color:rgba(255,255,255,0.85);margin:0;font-size:13px'>" + subheading + "</p></div>" +
            "<div style='padding:28px 32px'>" +
            "<p style='font-size:15px;color:#191919;margin-bottom:12px'>Dear <strong>" + name + "</strong>,</p>" +
            "<p style='color:#444;line-height:1.6;margin-bottom:0'>" + intro + "</p>" +
            content +
            "<div style='text-align:center;margin:24px 0'>" +
            "<a href='" + baseUrl + ctaPath + "' style='background:" + ctaColor + ";color:#fff;padding:13px 32px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block'>" + ctaLabel + " →</a></div>" +
            "<p style='color:" + ctaColor + ";font-weight:bold;margin-top:24px'>Team SkillBridge</p></div>" +
            "<div style='background:#f8f9fa;padding:14px;text-align:center;border-top:1px solid #e2e8f0'>" +
            "<p style='margin:0;color:#999;font-size:11px'>SkillBridge — CDAC PGCP-AC-002 | C-DAC Bangalore 2026 | Automated notification</p></div>" +
            "</div></body></html>";
    }
}

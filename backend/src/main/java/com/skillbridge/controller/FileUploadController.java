package com.skillbridge.controller;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.skillbridge.model.Skill;
import com.skillbridge.model.User;
import com.skillbridge.repository.SkillRepository;
import com.skillbridge.repository.UserRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    @PostMapping("/upload-resume")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file,
                                          Authentication auth) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF files are allowed"));
            }

            // Validate file size (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size must be less than 5MB"));
            }

            byte[] fileBytes = file.getBytes();
            String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "resume.pdf";

            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Store the resume directly in the database (persists across redeploys,
            // unlike the app server's disk).
            user.setResumeData(fileBytes);
            user.setResumeFileName(originalFilename);
            user.setResumeUrl("/api/files/resume/" + user.getId());
            userRepository.save(user);

            // ─── Suggest skills by scanning the resume text against the master skill list ───
            // Best-effort: if text extraction fails (e.g. a scanned/image-only PDF with no
            // real text layer), we still return upload success — suggestions are a bonus.
            List<String> suggestedSkills = new ArrayList<>();
            try {
                String resumeText = extractPdfText(fileBytes).toLowerCase();
                List<Skill> allSkills = skillRepository.findAll();
                List<String> alreadyTagged = user.getSkillsList();
                for (Skill skill : allSkills) {
                    String skillNameLower = skill.getName().toLowerCase();
                    boolean mentionedInResume = resumeText.contains(skillNameLower);
                    boolean notAlreadyTagged = alreadyTagged == null || !alreadyTagged.contains(skill.getName());
                    if (mentionedInResume && notAlreadyTagged) {
                        suggestedSkills.add(skill.getName());
                    }
                }
            } catch (Exception ex) {
                log.warn("⚠️ Could not extract text from resume for skill suggestions: {}", ex.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "url", user.getResumeUrl(),
                "fileName", originalFilename,
                "message", "Resume uploaded successfully!",
                "suggestedSkills", suggestedSkills
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /** Extracts all text from PDF bytes using iText (already a project dependency). */
    private String extractPdfText(byte[] pdfBytes) throws IOException {
        StringBuilder text = new StringBuilder();
        try (PdfDocument pdfDoc = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)))) {
            int pages = pdfDoc.getNumberOfPages();
            for (int i = 1; i <= pages; i++) {
                text.append(PdfTextExtractor.getTextFromPage(pdfDoc.getPage(i))).append(" ");
            }
        }
        return text.toString();
    }

    // Resume is fetched by the seeker's user ID (a UUID — same unguessability as the
    // random filenames used previously). Kept public so employers can view applicant
    // resumes without extra friction, matching the original design.
    @GetMapping("/resume/{userId}")
    public ResponseEntity<byte[]> viewResume(@PathVariable String userId) {
        return userRepository.findById(userId)
            .filter(u -> u.getResumeData() != null)
            .map(u -> ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + (u.getResumeFileName() != null ? u.getResumeFileName() : "resume.pdf") + "\"")
                .body(u.getResumeData()))
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/resume")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> deleteResume(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setResumeData(null);
        user.setResumeFileName(null);
        user.setResumeUrl(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
    }
}
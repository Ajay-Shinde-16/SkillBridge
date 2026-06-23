package com.skillbridge.controller;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

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

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".pdf";
            String fileName = UUID.randomUUID().toString() + "_resume" + extension;

            // Save file to disk
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Build file URL
            String fileUrl = "/api/files/resume/" + fileName;

            // Update user's resumeUrl in database
            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setResumeUrl(fileUrl);
            userRepository.save(user);

            // ─── Suggest skills by scanning the resume text against the master skill list ───
            // Best-effort: if text extraction fails for any reason (e.g. a scanned/image-only
            // PDF with no real text layer), we still return the upload success — skill
            // suggestions are a bonus, not a requirement for the upload to succeed.
            List<String> suggestedSkills = new ArrayList<>();
            try {
                String resumeText = extractPdfText(filePath).toLowerCase();
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
                log.warn("⚠️ Could not extract text from resume {} for skill suggestions: {}", fileName, ex.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "fileName", fileName,
                "message", "Resume uploaded successfully!",
                "suggestedSkills", suggestedSkills
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /** Extracts all text from a PDF on disk using iText (already a project dependency). */
    private String extractPdfText(Path filePath) throws IOException {
        StringBuilder text = new StringBuilder();
        try (PdfDocument pdfDoc = new PdfDocument(new PdfReader(filePath.toString()))) {
            int pages = pdfDoc.getNumberOfPages();
            for (int i = 1; i <= pages; i++) {
                text.append(PdfTextExtractor.getTextFromPage(pdfDoc.getPage(i))).append(" ");
            }
        }
        return text.toString();
    }

    @GetMapping("/resume/{fileName}")
    public ResponseEntity<Resource> viewResume(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/resume")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<?> deleteResume(Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getResumeUrl() != null) {
                String fileName = user.getResumeUrl().replace("/api/files/resume/", "");
                Path filePath = Paths.get(uploadDir).resolve(fileName);
                Files.deleteIfExists(filePath);
                user.setResumeUrl(null);
                userRepository.save(user);
            }

            return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to delete resume"));
        }
    }
}
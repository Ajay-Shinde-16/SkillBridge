package com.skillbridge.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class PdfService {

    private static final DeviceRgb BRAND_BLUE    = new DeviceRgb(10, 102, 194);   // #0A66C2
    private static final DeviceRgb BRAND_DARK    = new DeviceRgb(0, 65, 130);     // #004182
    private static final DeviceRgb LIGHT_GRAY    = new DeviceRgb(248, 249, 250);  // #F8F9FA
    private static final DeviceRgb BORDER_GRAY   = new DeviceRgb(226, 232, 240);  // #E2E8F0
    private static final DeviceRgb TEXT_DARK     = new DeviceRgb(25, 25, 25);     // #191919
    private static final DeviceRgb TEXT_MUTED    = new DeviceRgb(102, 102, 102);  // #666666
    private static final DeviceRgb GREEN_BG      = new DeviceRgb(209, 250, 229);  // #D1FAE5
    private static final DeviceRgb GREEN_TEXT    = new DeviceRgb(6, 95, 70);      // #065f46

    public byte[] generateOfferLetter(
            String seekerName,
            String seekerEmail,
            String jobTitle,
            String companyName,
            String companyWebsite,
            String employerName,
            double minSalary,
            double maxSalary,
            String jobType,
            boolean remote,
            String employerNote
    ) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(0, 0, 30, 0);

            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont italic  = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
            String refNo = "SB-OL-" + LocalDate.now().getYear() + "-" + Math.abs(seekerName.hashCode() % 9000 + 1000);

            // ══════════════════════════════════════════════
            // HEADER BANNER
            // ══════════════════════════════════════════════
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .setWidth(UnitValue.createPercentValue(100));

            // Left: Company branding
            Cell leftCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(BRAND_BLUE)
                    .setPadding(28);

            leftCell.add(new Paragraph("SkillBridge")
                    .setFont(bold).setFontSize(22).setFontColor(ColorConstants.WHITE).setMarginBottom(4));
            leftCell.add(new Paragraph("Remote Job Portal")
                    .setFont(regular).setFontSize(10).setFontColor(new DeviceRgb(180, 210, 240)).setMarginBottom(16));
            leftCell.add(new Paragraph(companyName)
                    .setFont(bold).setFontSize(13).setFontColor(ColorConstants.WHITE).setMarginBottom(3));
            if (companyWebsite != null && !companyWebsite.isEmpty()) {
                leftCell.add(new Paragraph(companyWebsite)
                        .setFont(regular).setFontSize(9).setFontColor(new DeviceRgb(180, 210, 240)));
            }
            headerTable.addCell(leftCell);

            // Right: Ref & Date
            Cell rightCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(BRAND_DARK)
                    .setPadding(28)
                    .setTextAlignment(TextAlignment.RIGHT);

            rightCell.add(new Paragraph("OFFER LETTER")
                    .setFont(bold).setFontSize(16).setFontColor(ColorConstants.WHITE)
                    .setCharacterSpacing(2).setMarginBottom(16));
            rightCell.add(new Paragraph("Ref No: " + refNo)
                    .setFont(regular).setFontSize(9).setFontColor(new DeviceRgb(180, 210, 240)).setMarginBottom(4));
            rightCell.add(new Paragraph("Date: " + today)
                    .setFont(regular).setFontSize(9).setFontColor(new DeviceRgb(180, 210, 240)));
            headerTable.addCell(rightCell);

            doc.add(headerTable);

            // ══════════════════════════════════════════════
            // BODY CONTENT
            // ══════════════════════════════════════════════
            // Wrapper with margins
            doc.add(new Paragraph("").setMarginTop(28));

            float LEFT  = 50;
            float RIGHT = 50;

            // ── Congratulations Banner ──
            Table congBanner = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginLeft(LEFT).setMarginRight(RIGHT);
            Cell congCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(GREEN_BG)
                    .setBorderLeft(new SolidBorder(new DeviceRgb(6, 118, 66), 4))
                    .setPadding(14);
            congCell.add(new Paragraph("🎉  Congratulations, " + seekerName + "!")
                    .setFont(bold).setFontSize(14).setFontColor(GREEN_TEXT).setMarginBottom(4));
            congCell.add(new Paragraph("We are delighted to extend this offer of employment to you.")
                    .setFont(regular).setFontSize(10).setFontColor(GREEN_TEXT).setMarginBottom(0));
            congBanner.addCell(congCell);
            doc.add(congBanner);
            doc.add(new Paragraph("").setMarginTop(20));

            // ── Salutation ──
            addBodyText(doc, bold, regular, LEFT, RIGHT,
                    "Dear " + seekerName + ",",
                    "We are pleased to inform you that " + companyName +
                    " has decided to offer you the position of " + jobTitle +
                    ". This offer is based on your impressive skills and qualifications demonstrated during " +
                    "the interview process. We believe you will be a valuable addition to our team.",
                    today);

            doc.add(new Paragraph("").setMarginTop(18));

            // ── Offer Details Box ──
            doc.add(new Paragraph("OFFER DETAILS")
                    .setFont(bold).setFontSize(10).setFontColor(BRAND_BLUE)
                    .setCharacterSpacing(1.5f)
                    .setMarginLeft(LEFT).setMarginRight(RIGHT).setMarginBottom(8));

            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginLeft(LEFT).setMarginRight(RIGHT);

            String[][] details = {
                    {"Candidate Name",   seekerName},
                    {"Email Address",    seekerEmail},
                    {"Position",         jobTitle},
                    {"Employment Type",  jobType != null ? jobType.replace("_", " ") : "Full Time"},
                    {"Work Mode",        remote ? "Remote (Work from Home)" : "On-site"},
                    {"Offered By",       employerName != null ? employerName : companyName},
                    {"Company",          companyName},
                    {"Offer Date",       today},
                    {"CTC Range",        minSalary > 0
                            ? "₹" + formatSalary(minSalary) + " – ₹" + formatSalary(maxSalary) + " per annum"
                            : "To be discussed"},
            };

            boolean altRow = false;
            for (String[] row : details) {
                DeviceRgb rowBg = altRow ? LIGHT_GRAY : new DeviceRgb(255, 255, 255);

                Cell labelCell = new Cell()
                        .setBackgroundColor(rowBg)
                        .setBorder(new SolidBorder(BORDER_GRAY, 0.5f))
                        .setPaddingLeft(14).setPaddingRight(8).setPaddingTop(9).setPaddingBottom(9);
                labelCell.add(new Paragraph(row[0])
                        .setFont(bold).setFontSize(9.5f).setFontColor(TEXT_MUTED));

                Cell valueCell = new Cell()
                        .setBackgroundColor(rowBg)
                        .setBorder(new SolidBorder(BORDER_GRAY, 0.5f))
                        .setPaddingLeft(14).setPaddingRight(14).setPaddingTop(9).setPaddingBottom(9);
                valueCell.add(new Paragraph(row[1])
                        .setFont(row[0].equals("Position") || row[0].equals("CTC Range") ? bold : regular)
                        .setFontSize(9.5f)
                        .setFontColor(row[0].equals("Position") ? BRAND_BLUE : TEXT_DARK));

                detailsTable.addCell(labelCell);
                detailsTable.addCell(valueCell);
                altRow = !altRow;
            }
            doc.add(detailsTable);
            doc.add(new Paragraph("").setMarginTop(20));

            // ── Terms & Conditions ──
            doc.add(new Paragraph("TERMS & CONDITIONS")
                    .setFont(bold).setFontSize(10).setFontColor(BRAND_BLUE)
                    .setCharacterSpacing(1.5f)
                    .setMarginLeft(LEFT).setMarginRight(RIGHT).setMarginBottom(10));

            String[] terms = {
                    "This offer is contingent upon successful completion of background verification and document submission.",
                    "The candidate is required to accept or decline this offer within 3 business days from the date of this letter.",
                    "The compensation package includes base salary and is subject to applicable tax deductions as per government norms.",
                    "This offer does not constitute a contract of employment until a formal employment agreement is signed by both parties.",
                    "The company reserves the right to withdraw this offer if any information provided by the candidate is found to be false or misleading.",
            };

            Table termsTable = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginLeft(LEFT).setMarginRight(RIGHT);

            for (int i = 0; i < terms.length; i++) {
                Cell tc = new Cell()
                        .setBorder(Border.NO_BORDER)
                        .setPaddingTop(4).setPaddingBottom(4).setPaddingLeft(0).setPaddingRight(0);
                tc.add(new Paragraph((i + 1) + ".  " + terms[i])
                        .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED)
                        .setMarginBottom(0).setMultipliedLeading(1.4f));
                termsTable.addCell(tc);
            }
            doc.add(termsTable);
            doc.add(new Paragraph("").setMarginTop(20));

            // ── Employer Note ──
            if (employerNote != null && !employerNote.isEmpty()) {
                Table noteTable = new Table(UnitValue.createPercentArray(new float[]{100}))
                        .setWidth(UnitValue.createPercentValue(100))
                        .setMarginLeft(LEFT).setMarginRight(RIGHT);
                Cell noteCell = new Cell()
                        .setBorder(new SolidBorder(BRAND_BLUE, 0.5f))
                        .setBackgroundColor(new DeviceRgb(238, 243, 248))
                        .setPadding(12);
                noteCell.add(new Paragraph("Message from Employer:")
                        .setFont(bold).setFontSize(9.5f).setFontColor(BRAND_BLUE).setMarginBottom(4));
                noteCell.add(new Paragraph(employerNote)
                        .setFont(italic).setFontSize(9.5f).setFontColor(TEXT_DARK).setMarginBottom(0));
                noteTable.addCell(noteCell);
                doc.add(noteTable);
                doc.add(new Paragraph("").setMarginTop(20));
            }

            // ── Response Instructions ──
            Table respTable = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginLeft(LEFT).setMarginRight(RIGHT);
            Cell respCell = new Cell()
                    .setBorder(new SolidBorder(new DeviceRgb(253, 186, 116), 1))
                    .setBackgroundColor(new DeviceRgb(255, 251, 235))
                    .setPadding(12);
            respCell.add(new Paragraph("⚠  Action Required")
                    .setFont(bold).setFontSize(10).setFontColor(new DeviceRgb(146, 64, 14)).setMarginBottom(5));
            respCell.add(new Paragraph(
                    "Please login to SkillBridge portal and navigate to 'My Offers' to Accept or Decline this offer. " +
                    "Your response is required within 3 business days from the date of this letter.")
                    .setFont(regular).setFontSize(9.5f).setFontColor(new DeviceRgb(120, 53, 15)).setMarginBottom(0));
            respTable.addCell(respCell);
            doc.add(respTable);
            doc.add(new Paragraph("").setMarginTop(28));

            // ── Signature Block ──
            Table sigTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginLeft(LEFT).setMarginRight(RIGHT);

            // Employer signature
            Cell empSig = new Cell().setBorder(Border.NO_BORDER).setPadding(0);
            empSig.add(new Paragraph("For " + companyName)
                    .setFont(bold).setFontSize(10).setFontColor(TEXT_DARK).setMarginBottom(40));
            empSig.add(new LineSeparator(new SolidLine(1)).setMarginBottom(6));
            empSig.add(new Paragraph(employerName != null ? employerName : "Authorized Signatory")
                    .setFont(bold).setFontSize(9.5f).setFontColor(TEXT_DARK).setMarginBottom(3));
            empSig.add(new Paragraph("Authorized Signatory")
                    .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED));
            sigTable.addCell(empSig);

            // Candidate acceptance
            Cell candSig = new Cell().setBorder(Border.NO_BORDER).setPadding(0)
                    .setTextAlignment(TextAlignment.RIGHT);
            candSig.add(new Paragraph("Accepted by Candidate")
                    .setFont(bold).setFontSize(10).setFontColor(TEXT_DARK).setMarginBottom(40));
            candSig.add(new LineSeparator(new SolidLine(1)).setMarginBottom(6));
            candSig.add(new Paragraph(seekerName)
                    .setFont(bold).setFontSize(9.5f).setFontColor(TEXT_DARK).setMarginBottom(3));
            candSig.add(new Paragraph("Candidate Signature & Date")
                    .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED));
            sigTable.addCell(candSig);
            doc.add(sigTable);

            // ══════════════════════════════════════════════
            // FOOTER
            // ══════════════════════════════════════════════
            doc.add(new Paragraph("").setMarginTop(24));
            Table footerTable = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .setWidth(UnitValue.createPercentValue(100));
            Cell footerCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(BRAND_BLUE)
                    .setPadding(14)
                    .setTextAlignment(TextAlignment.CENTER);
            footerCell.add(new Paragraph("This is a computer-generated offer letter issued by SkillBridge Portal.")
                    .setFont(regular).setFontSize(8).setFontColor(new DeviceRgb(200, 225, 255)).setMarginBottom(3));
            footerCell.add(new Paragraph("Ref: " + refNo + "  |  " + companyName + "  |  SkillBridge — CDAC PGCP-AC-002")
                    .setFont(regular).setFontSize(8).setFontColor(new DeviceRgb(200, 225, 255)));
            footerTable.addCell(footerCell);
            doc.add(footerTable);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate offer letter PDF: {}", e.getMessage());
            return new byte[0];
        }
    }

    private void addBodyText(Document doc, PdfFont bold, PdfFont regular,
                              float left, float right, String salutation, String body, String date) {
        doc.add(new Paragraph(salutation)
                .setFont(bold).setFontSize(11).setFontColor(new DeviceRgb(25, 25, 25))
                .setMarginLeft(left).setMarginRight(right).setMarginBottom(12));
        doc.add(new Paragraph(body)
                .setFont(regular).setFontSize(10).setFontColor(new DeviceRgb(50, 50, 50))
                .setMultipliedLeading(1.5f)
                .setMarginLeft(left).setMarginRight(right).setMarginBottom(0));
    }

    private String formatSalary(double salary) {
        if (salary >= 100000) {
            return String.format("%.1fL", salary / 100000);
        }
        return String.format("%.0f", salary);
    }
}

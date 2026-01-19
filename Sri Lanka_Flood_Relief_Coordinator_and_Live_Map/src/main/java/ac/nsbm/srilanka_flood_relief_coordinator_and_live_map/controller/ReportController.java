package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Report;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadReport(@RequestParam("file") MultipartFile file,
                                          @RequestParam("title") String title,
                                          @RequestParam("description") String description,
                                          @RequestParam("username") String username) {
        try {
            reportService.saveReport(title, description, username, file);
            return ResponseEntity.ok("Report uploaded successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload report: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReportFile(@PathVariable Long id) {
        Report report = reportService.getReport(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(report.getFileType()))
                .body(report.getData());
    }
}
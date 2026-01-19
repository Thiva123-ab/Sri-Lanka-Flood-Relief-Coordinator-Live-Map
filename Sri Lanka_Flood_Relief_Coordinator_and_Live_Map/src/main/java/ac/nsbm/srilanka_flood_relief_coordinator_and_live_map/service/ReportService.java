package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Report;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report saveReport(String title, String description, String username, MultipartFile file) throws IOException {
        Report report = new Report();
        report.setTitle(title);
        report.setDescription(description);
        report.setSubmittedBy(username);
        report.setTimestamp(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            report.setFileName(file.getOriginalFilename());
            report.setFileType(file.getContentType());
            report.setData(file.getBytes());
        }

        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByTimestampDesc();
    }

    public Report getReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id " + id));
    }
}
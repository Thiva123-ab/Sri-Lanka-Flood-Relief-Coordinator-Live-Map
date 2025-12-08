class AnalysisManager {
    constructor() {
        this.incidents = [];
        this.helpRequests = [];
        this.init();
    }

    init() {
        // Check Auth
        if (!window.authManager || !window.authManager.isAdmin()) {
            alert("Access Denied. Admins only.");
            window.location.href = 'login.html';
            return;
        }

        this.loadData();

        document.getElementById('download-pdf-btn').addEventListener('click', () => this.generatePDF());
    }

    async loadData() {
        try {
            // Fetch Verified Incidents
            const incidentsRes = await fetch('http://localhost:8080/api/markers/approved');
            this.incidents = await incidentsRes.json();

            // Fetch Help Requests (Requires Auth)
            const requestsRes = await fetch('http://localhost:8080/api/help-requests', { credentials: 'include' });
            this.helpRequests = await requestsRes.json();

            this.updateStats();
            this.renderCharts();

        } catch (error) {
            console.error("Error loading analysis data:", error);
            alert("Failed to load data for analysis.");
        }
    }

    updateStats() {
        document.getElementById('total-incidents').textContent = this.incidents.length;
        document.getElementById('total-requests').textContent = this.helpRequests.length;

        // Calculate High Risk (Severity = Critical or High)
        const highRisk = this.incidents.filter(i =>
            i.severity && (i.severity.toLowerCase() === 'critical' || i.severity.toLowerCase() === 'high')
        ).length;
        document.getElementById('high-risk-count').textContent = highRisk;
    }

    renderCharts() {
        // 1. Incident Type Chart
        const typeCounts = {};
        this.incidents.forEach(i => {
            const type = i.type || 'Other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        new Chart(document.getElementById('incidentChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts).map(s => s.toUpperCase().replace('-', ' ')),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: ['#2196F3', '#FF9800', '#9E9E9E', '#4CAF50', '#F44336'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#fff' } }
                }
            }
        });

        // 2. Help Needs Chart
        const needCounts = {};
        this.helpRequests.forEach(req => {
            if (req.needs && Array.isArray(req.needs)) {
                req.needs.forEach(need => {
                    needCounts[need] = (needCounts[need] || 0) + 1;
                });
            } else {
                // Handle legacy data or single string
                const need = req.needs || "General";
                needCounts[need] = (needCounts[need] || 0) + 1;
            }
        });

        new Chart(document.getElementById('needsChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(needCounts),
                datasets: [{
                    label: 'Requests',
                    data: Object.values(needCounts),
                    backgroundColor: '#FFD700',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { ticks: { color: '#fff' }, grid: { display: false } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Blue color
        doc.text("Flood Relief Sri Lanka - Situation Report", 14, 20);

        // Date
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Summary Stats
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 35, 180, 25, 'F');
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`Total Incidents: ${this.incidents.length}`, 20, 50);
        doc.text(`Active Help Requests: ${this.helpRequests.length}`, 100, 50);

        // --- Section 1: Help Requests Table ---
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text("Emergency Help Requests", 14, 75);

        const requestRows = this.helpRequests.map(req => [
            req.name,
            req.phone,
            (Array.isArray(req.needs) ? req.needs.join(", ") : req.needs) || "General",
            req.details || "No details"
        ]);

        doc.autoTable({
            startY: 80,
            head: [['Name', 'Phone', 'Needs', 'Details']],
            body: requestRows,
            theme: 'grid',
            headStyles: { fillColor: [244, 67, 54] } // Red header for emergency
        });

        // --- Section 2: Flood Incidents Table ---
        let finalY = doc.lastAutoTable.finalY + 15; // Start below previous table

        // Check if we need a new page
        if (finalY > 250) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text("Verified Flood Incidents", 14, finalY);

        const incidentRows = this.incidents.map(inc => [
            inc.name,
            inc.type.toUpperCase(),
            inc.severity ? inc.severity.toUpperCase() : 'N/A',
            inc.description
        ]);

        doc.autoTable({
            startY: finalY + 5,
            head: [['Location', 'Type', 'Severity', 'Description']],
            body: incidentRows,
            theme: 'striped',
            headStyles: { fillColor: [76, 175, 80] } // Green header
        });

        // Save
        doc.save("Flood_Relief_Situation_Report.pdf");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnalysisManager();
});
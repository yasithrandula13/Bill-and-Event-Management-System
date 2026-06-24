// Example bill data
const bills = [
  { category: "electricity", status: "paid", dueDate: "2025-09-10", amount: 120 },
  { category: "water", status: "unpaid", dueDate: "2025-09-15", amount: 50 },
  { category: "rent", status: "paid", dueDate: "2025-09-01", amount: 500 },
  { category: "internet", status: "paid", dueDate: "2025-09-12", amount: 80 },
  { category: "other", status: "unpaid", dueDate: "2025-09-20", amount: 30 }
];

let lastReportData = null;

// Category emojis
const categoryEmojis = {
  electricity: "⚡",
  water: "💧",
  rent: "🏠",
  internet: "🌐",
  other: "📦"
};

function generateReport() {
  const category = document.getElementById("reportCategory").value;
  const status = document.getElementById("reportStatus").value;
  const date = document.getElementById("reportDate").value;
  const type = document.getElementById("reportType").value;
  const month = document.getElementById("reportMonth").value;

  let filteredBills = bills;

  // Apply filters
  if (category !== "all") {
    filteredBills = filteredBills.filter(b => b.category === category);
  }
  if (status !== "all") {
    filteredBills = filteredBills.filter(b => b.status === status);
  }
  if (date) {
    filteredBills = filteredBills.filter(b => new Date(b.dueDate) <= new Date(date));
  }
  if (month) {
    const [year, monthIndex] = month.split("-");
    filteredBills = filteredBills.filter(b => {
      const billDate = new Date(b.dueDate);
      return billDate.getFullYear() === parseInt(year) && (billDate.getMonth() + 1) === parseInt(monthIndex);
    });
  }

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Store report data for PDF generation
  lastReportData = {
    category,
    status,
    date: date || "No date filter",
    type,
    month: month || "Not selected",
    bills: filteredBills,
    totalAmount,
    currentDate
  };

  // Generate HTML report
  let reportHTML = `
    <div class="report-template-bill-report">
      <div class="report-header-bill-report">
        <h2 class="report-title-bill-report">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          Bill Report
        </h2>
        <p class="report-date-bill-report">Generated on ${currentDate}</p>
      </div>

      <div class="report-filters-bill-report">
        <h4>Report Parameters</h4>
        <div class="filter-info-bill-report">
          <div class="filter-item-bill-report">
            <strong>Category:</strong>
            <span>${category === "all" ? "All Categories" : categoryEmojis[category] + " " + category.charAt(0).toUpperCase() + category.slice(1)}</span>
          </div>
          <div class="filter-item-bill-report">
            <strong>Status:</strong>
            <span>${status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
          <div class="filter-item-bill-report">
            <strong>Due Before:</strong>
            <span>${date || "No date filter"}</span>
          </div>
          <div class="filter-item-bill-report">
            <strong>Report Type:</strong>
            <span>${type === "monthly" ? "Monthly Report" : "Annual Report"}</span>
          </div>
          <div class="filter-item-bill-report">
            <strong>Month:</strong>
            <span>${month || "Not selected"}</span>
          </div>
        </div>
      </div>

      <table class="report-table-bill-report">
        <thead>
          <tr>
            <th>Category</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (filteredBills.length > 0) {
    filteredBills.forEach(bill => {
      const statusClass = bill.status === "paid" ? "status-paid-bill-report" : "status-unpaid-bill-report";
      reportHTML += `
        <tr>
          <td>${categoryEmojis[bill.category]} ${bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}</td>
          <td><span class="status-badge-bill-report ${statusClass}">${bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span></td>
          <td>${new Date(bill.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
          <td><strong>$${bill.amount.toFixed(2)}</strong></td>
        </tr>
      `;
    });
  } else {
    reportHTML += `
      <tr>
        <td colspan="4" class="no-data-bill-report">No bills found for the selected filters.</td>
      </tr>
    `;
  }

  reportHTML += `
        </tbody>
      </table>

      <div class="report-summary-bill-report">
        <h4>Total Amount</h4>
        <div class="total-amount-bill-report">$${totalAmount.toFixed(2)}</div>
      </div>
    </div>
  `;

  document.getElementById("reportOutput").innerHTML = reportHTML;

  // Show success message
  showNotification("Report generated successfully!", "success");
}

function downloadReport() {
  if (!lastReportData) {
    showNotification("Please generate a report first!", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Colors
  const primaryColor = [102, 126, 234];
  const secondaryColor = [118, 75, 162];
  const greenColor = [72, 187, 120];
  const textColor = [45, 55, 72];
  const lightGray = [226, 232, 240];

  // Add gradient header background (simulated with rectangles)
  for (let i = 0; i < 40; i++) {
    const ratio = i / 40;
    const r = primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * ratio;
    const g = primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * ratio;
    const b = primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * ratio;
    doc.setFillColor(r, g, b);
    doc.rect(0, i * 0.5, 210, 0.5, 'F');
  }

  // Header - Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text("Bill Report", 105, 15, { align: "center" });

  // Generated date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on ${lastReportData.currentDate}`, 105, 22, { align: "center" });

  // Reset text color
  doc.setTextColor(...textColor);

  // Report Parameters Box
  let yPos = 35;
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yPos, 180, 40, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text("Report Parameters", 20, yPos + 7);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...textColor);

  const params = [
    `Category: ${lastReportData.category === "all" ? "All Categories" : lastReportData.category.charAt(0).toUpperCase() + lastReportData.category.slice(1)}`,
    `Status: ${lastReportData.status === "all" ? "All Status" : lastReportData.status.charAt(0).toUpperCase() + lastReportData.status.slice(1)}`,
    `Due Before: ${lastReportData.date}`,
    `Report Type: ${lastReportData.type === "monthly" ? "Monthly Report" : "Annual Report"}`,
    `Month: ${lastReportData.month}`
  ];

  let paramY = yPos + 15;
  params.forEach((param, index) => {
    const xPos = index < 3 ? 20 : 110;
    const localY = index < 3 ? paramY + (index * 7) : paramY + ((index - 3) * 7);
    doc.text(param, xPos, localY);
  });

  yPos = 80;

  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos, 180, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text("Category", 20, yPos + 7);
  doc.text("Status", 70, yPos + 7);
  doc.text("Due Date", 110, yPos + 7);
  doc.text("Amount", 160, yPos + 7);

  yPos += 10;

  // Table Rows
  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  if (lastReportData.bills.length > 0) {
    lastReportData.bills.forEach((bill, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(247, 250, 252);
        doc.rect(15, yPos, 180, 8, 'F');
      }

      // Category
      doc.text(
          `${categoryEmojis[bill.category] || ""} ${bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}`,
          20,
          yPos + 6
      );

      // Status badge
      if (bill.status === "paid") {
        doc.setFillColor(198, 246, 213);
        doc.setTextColor(34, 84, 61);
      } else {
        doc.setFillColor(254, 215, 215);
        doc.setTextColor(116, 42, 42);
      }
      doc.roundedRect(68, yPos + 1.5, 20, 5, 1, 1, 'F');
      doc.setFontSize(8);
      doc.text(bill.status.charAt(0).toUpperCase() + bill.status.slice(1), 78, yPos + 5, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(...textColor);

      // Due Date
      const formattedDate = new Date(bill.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      doc.text(formattedDate, 110, yPos + 6);

      // Amount
      doc.setFont(undefined, 'bold');
      doc.text(`${bill.amount.toFixed(2)}`, 160, yPos + 6);
      doc.setFont(undefined, 'normal');

      yPos += 8;

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;

        // Re-add table header
        doc.setFillColor(...primaryColor);
        doc.rect(15, yPos, 180, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("Category", 20, yPos + 7);
        doc.text("Status", 70, yPos + 7);
        doc.text("Due Date", 110, yPos + 7);
        doc.text("Amount", 160, yPos + 7);
        yPos += 10;
        doc.setTextColor(...textColor);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
      }
    });
  } else {
    doc.setTextColor(113, 128, 150);
    doc.setFont(undefined, 'italic');
    doc.text("No bills found for the selected filters.", 105, yPos + 10, { align: "center" });
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...textColor);
    yPos += 15;
  }

  // Summary Box
  yPos += 10;
  doc.setFillColor(...greenColor);
  doc.roundedRect(15, yPos, 180, 25, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Total Amount", 105, yPos + 10, { align: "center" });

  doc.setFontSize(22);
  doc.text(`${lastReportData.totalAmount.toFixed(2)}`, 105, yPos + 20, { align: "center" });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(136, 136, 136);
    doc.setFont(undefined, 'normal');

    // Decorative line
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(15, 285, 195, 285);

    doc.text("Bill & Event Reminder System", 15, 290);
    doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
  }

  // Save PDF
  const fileName = `Bill_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);

  showNotification("PDF downloaded successfully!", "success");
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #48bb78, #38a169)' : 'linear-gradient(135deg, #f56565, #e53e3e)'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease;
  `;

  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success'
      ? '<polyline points="20 6 9 17 4 12"></polyline>'
      : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Event Listeners
document.getElementById("generateReportBtn").addEventListener("click", generateReport);
document.getElementById("downloadReportBtn").addEventListener("click", downloadReport);
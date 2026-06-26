import { ReportRow } from "@/app/types/report";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function downloadReportPdf(rows: ReportRow[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(18);
  doc.text("Recognition Report", 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString("th-TH")}`, 14, 23);
  doc.text(`${rows.length} record(s)`, 14, 29);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 34,
    head: [["Employee", "Branch", "Core Value", "Comment", "Sent By", "Date"]],
    body: rows.map((row) => [
      row.personName,
      row.branch,
      row.coreValueLabel,
      row.comment,
      row.senderName,
      formatDate(row.createdAt),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 28 },
      2: { cellWidth: 38 },
      3: { cellWidth: 80 },
      4: { cellWidth: 35 },
      5: { cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`recognition-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function downloadReportCsv(rows: ReportRow[]) {
  const headers = ["Employee", "Branch", "Core Value", "Comment", "Sent By", "Date"];
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.personName,
        row.branch,
        row.coreValueLabel,
        row.comment,
        row.senderName,
        formatDate(row.createdAt),
      ]
        .map((value) => csvEscape(String(value)))
        .join(",")
    );
  }

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `recognition-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

import { ReportRow } from "@/app/types/report";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { registerThaiFont } from "./thaiFont";

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

type RGB = [number, number, number];

const COLORS = {
  ink: [15, 23, 42] as RGB,        // slate-900
  subtle: [100, 116, 139] as RGB,  // slate-500
  line: [203, 213, 225] as RGB,    // slate-300
  headerBg: [15, 23, 42] as RGB,   // slate-900
  headerText: [255, 255, 255] as RGB,
  stripe: [248, 250, 252] as RGB,  // slate-50
  accent: [79, 70, 229] as RGB,    // indigo-600
};

const FONT = "Sarabun";

export function downloadReportPdf(rows: ReportRow[]) {
  // A4 portrait: 210mm wide. Narrower than landscape, so column
  // proportions below are tuned specifically for this width.
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Embed the Thai-capable font and make it the default for the whole document.
  registerThaiFont(doc);
  doc.setFont(FONT, "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;

  const generatedAt = new Date().toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const drawHeader = () => {
    doc.setFont(FONT, "bold");
    doc.setFontSize(17);
    doc.setTextColor(...COLORS.ink);
    doc.text("Recognition Report", marginX, 15);

    doc.setFont(FONT, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.subtle);
    doc.text("Employee recognition records", marginX, 20.5);

    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.8);
    doc.line(marginX, 23.5, marginX + 22, 23.5);

    const metaRight = pageWidth - marginX;
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.subtle);
    doc.text(`Generated: ${generatedAt}`, metaRight, 13, { align: "right" });

    doc.setFont(FONT, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.ink);
    doc.text(`${rows.length} record${rows.length === 1 ? "" : "s"}`, metaRight, 18, {
      align: "right",
    });

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(marginX, 27, pageWidth - marginX, 27);
  };

  const drawFooter = (pageNumber: number, pageCount: number) => {
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont(FONT, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.subtle);
    doc.text("Recognition Report \u2022 Confidential", marginX, pageHeight - 7);
    doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - marginX, pageHeight - 7, {
      align: "right",
    });
  };

  // Header for the first page
  drawHeader();

  // Available width for the table = page width minus both margins.
  // Columns are sized so they always sum to (roughly) this value, so
  // autoTable's word-wrap has an accurate box to wrap inside instead of
  // letting long Thai/English content spill past the cell border.
  const usableWidth = pageWidth - marginX * 2; // ~186mm on A4 portrait

  autoTable(doc, {
    startY: 31,
    head: [["Recipients", "Branch", "Core Value", "Comment", "Sent By", "Date"]],
    body: rows.map((row) => [
      row.personName,
      row.branch,
      row.coreValueLabel || "-",
      row.comment,
      row.senderName,
      formatDate(row.createdAt),
    ]),
    theme: "grid",
    tableWidth: usableWidth,
    styles: {
      font: FONT,
      fontStyle: "normal",
      fontSize: 9,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
      overflow: "linebreak",
      lineColor: COLORS.line,
      lineWidth: 0.2,
      textColor: COLORS.ink,
      valign: "middle",
      minCellHeight: 7,
    },
    headStyles: {
      font: FONT,
      fillColor: COLORS.headerBg,
      textColor: COLORS.headerText,
      fontStyle: "bold",
      fontSize: 13,
      halign: "left",
      cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
    },
    alternateRowStyles: {
      fillColor: COLORS.stripe,
    },
    // Portrait usable width is ≈186mm — narrower than landscape, so
    // Comment gets a smaller absolute share and Branch/Date/Sent By
    // are trimmed to the minimum that still reads comfortably.
    // Proportions: 14/11/14/38/13/10 = 100%
    columnStyles: {
      0: { cellWidth: usableWidth * 0.14, fontStyle: "bold" },          // Employee
      1: { cellWidth: usableWidth * 0.11 },                             // Branch
      2: { cellWidth: usableWidth * 0.14 },                             // Core Value
      3: { cellWidth: usableWidth * 0.38 },                             // Comment
      4: { cellWidth: usableWidth * 0.13 },                             // Sent By
      5: { cellWidth: usableWidth * 0.1, textColor: COLORS.subtle },    // Date
    },
    margin: { left: marginX, right: marginX, top: 31, bottom: 16 },
    didParseCell: (data) => {
      // Belt-and-suspenders: guarantee every cell uses the Thai-capable
      // font even if a plugin default tries to reset it per-cell.
      data.cell.styles.font = FONT;
    },
    didDrawPage: () => {
      // Repeat header on every page after the first
      if (doc.getCurrentPageInfo().pageNumber > 1) {
        drawHeader();
      }
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(i, pageCount);
  }

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
import { HistoryItem } from "../types/history";
import { ReportRow } from "../types/report";
import { downloadReportCsv, downloadReportPdf } from "./reportExport";

const toReportRows = (items: HistoryItem[]): ReportRow[] => items.map((item) => ({
  id: item.id,
  personId: item.recipient.user_id,
  personName: `${item.recipient.firstName} ${item.recipient.lastName}`.trim(),
  branch: item.recipient.branch || "-",
  comment: item.comment,
  coreValue: item.coreValues.join(", "),
  coreValueLabel: item.coreValues.join(", "),
  createdAt: item.createdDate,
  year: item.year,
  createdBy: "",
  senderName: item.senderName,
}));

export function downloadHistoryCsv(items: HistoryItem[]) {
  downloadReportCsv(toReportRows(items));
}

export function downloadHistoryPdf(items: HistoryItem[]) {
  downloadReportPdf(toReportRows(items));
}

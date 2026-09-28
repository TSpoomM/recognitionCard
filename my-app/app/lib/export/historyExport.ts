import { HistoryItem } from "../../types/history";
import { ReportRow } from "../../types/report";
import { downloadReportCsv, downloadReportPdf } from "./reportExport";
import { COMMENT_TYPES, COMMENT_TYPE_META, CommentType } from "../../types/commentType";

function normalizeCoreValueCode(value: string) {
  const raw = value.trim().toUpperCase();
  const beforeParen = raw.replace(/\(.*\)$/, "").trim();
  const candidate = beforeParen.replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "_").replace(/^_+|_+$/g, "");
  if (COMMENT_TYPES.includes(candidate as CommentType)) return candidate;
  const fallback = COMMENT_TYPES.find((type) => beforeParen.includes(type));
  return fallback || candidate;
}

function getCoreValueDisplayLabel(value: string) {
  const code = normalizeCoreValueCode(value);
  const meta = COMMENT_TYPE_META[code as CommentType];
  return meta ? meta.en : value.trim();
}

const toReportRows = (items: HistoryItem[]): ReportRow[] => items.map((item) => {
  const rawCoreValues = item.coreValues.map((v) => v.trim()).filter(Boolean);
  const displayLabels = rawCoreValues.map(getCoreValueDisplayLabel);

  return {
    id: item.id,
    personId: item.recipient.user_id,
    personName: `${item.recipient.firstName} ${item.recipient.lastName}`.trim(),
    branch: item.recipient.branch || "-",
    comment: item.comment,
    coreValue: item.coreValues.join(", "),
    coreValueLabel: displayLabels.join(", "),
    createdAt: item.createdDate,
    year: item.year,
    createdBy: "",
    senderName: item.senderName,
  };
});

export function downloadHistoryCsv(items: HistoryItem[]) {
  downloadReportCsv(toReportRows(items));
  console.log("item.csv", items);
}

export function downloadHistoryPdf(items: HistoryItem[]) {
  downloadReportPdf(toReportRows(items));
  console.log("item.pdf", items);
  
}

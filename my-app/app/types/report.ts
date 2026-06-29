export type ReportEmployee = {
  user_id: string;
  name: string;
  branch: string;
};

export type ReportRow = {
  id: string;
  personId: string;
  personName: string;
  branch: string;
  comment: string;
  coreValue: string;
  coreValueLabel: string;
  createdAt: string | null;
  year: number | null;
  createdBy: string;
  senderName: string;
};

export type ReportData = {
  rows: ReportRow[];
  branches: string[];
  employees: ReportEmployee[];
  years: number[];
};

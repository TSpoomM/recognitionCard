import { requireAdmin } from "@/app/lib/adminAuth";
import { pool } from "@/app/lib/db";
import { getCoreValueLabel, parseCoreValues, splitName } from "@/app/lib/reportUtils";
import { ReportData, ReportEmployee, ReportRow } from "@/app/types/report";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

type DiaryReportRow = RowDataPacket & {
  diary_list: number;
  diary_emp_id: string | number;
  diary_comment: string | null;
  diary_corevalue: string | null;
  createdDate: Date | string | null;
  createdBy: string | number;
  recipient_name: string | null;
  location_emp: string | null;
  sender_name: string | null;
};

type EmployeeBranchRow = RowDataPacket & {
  fs_id: string | number;
  emp_name_en: string | null;
  location_emp: string | null;
};

export async function GET(request: Request) {
  try {
    const { isAdmin } = await requireAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required." },
        { status: 403 }
      );
    }

    const [diaryRows] = await pool.query<DiaryReportRow[]>(
      `
      SELECT
        d.diary_list,
        d.diary_emp_id,
        d.diary_comment,
        d.diary_corevalue,
        d.createdDate,
        d.createdBy,
        e.emp_name_en AS recipient_name,
        e.location_emp,
        sender.emp_name_en AS sender_name
      FROM tb_diary_list d
      LEFT JOIN tb_employee_list e
        ON d.diary_emp_id = e.fs_id
      LEFT JOIN tb_employee_list sender
        ON d.createdBy = sender.fs_id
      ORDER BY d.createdDate DESC, d.diary_list DESC
      `
    );

    const [employeeRows] = await pool.query<EmployeeBranchRow[]>(
      `
      SELECT fs_id, emp_name_en, location_emp
      FROM tb_employee_list
      WHERE emp_name_en IS NOT NULL
      ORDER BY emp_name_en ASC
      `
    );

    const rows: ReportRow[] = [];

    for (const row of diaryRows) {
      const personId = String(row.diary_emp_id);
      const personName = row.recipient_name?.trim() || `Employee #${personId}`;
      const branch = row.location_emp?.trim() || "Unknown";
      const senderName = row.sender_name?.trim() || String(row.createdBy);
      const coreValues = parseCoreValues(row.diary_corevalue);
      const values = coreValues.length > 0 ? coreValues : [""];

      for (const coreValue of values) {
        rows.push({
          id: `${row.diary_list}-${personId}-${coreValue || "none"}`,
          personId,
          personName,
          branch,
          comment: row.diary_comment || "",
          coreValue,
          coreValueLabel: coreValue ? getCoreValueLabel(coreValue) : "",
          createdAt: row.createdDate ? new Date(row.createdDate).toISOString() : null,
          createdBy: String(row.createdBy),
          senderName,
        });
      }
    }

    const branches = [...new Set(rows.map((row) => row.branch).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

    const employees: ReportEmployee[] = employeeRows.map((row) => {
      const fullName = row.emp_name_en?.trim() || String(row.fs_id);
      const { firstName, lastName } = splitName(fullName);

      return {
        user_id: String(row.fs_id),
        name: `${firstName} ${lastName}`.trim(),
        branch: row.location_emp?.trim() || "Unknown",
      };
    });

    const data: ReportData = { rows, branches, employees };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

import { pool } from "@/app/lib/db";
import { getRequestCurrentUserId } from "@/app/lib/currentUser";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

type HistoryRow = RowDataPacket & {
  diary_list: number;
  diary_emp_id: string | number | null;
  diary_comment: string | null;
  diary_corevalue: string | null;
  createdDate: Date | string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_position: string | null;
  recipient_branch: string | null;
  sender_name: string | null;
};

function splitName(fullName: string) {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: firstName || fullName,
    lastName: rest.join(" "),
  };
}

export async function GET(request: Request) {
  try {
    const currentUserId = await getRequestCurrentUserId(request);

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Current user id is required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<HistoryRow[]>(
      `
      SELECT
        d.diary_list,
        d.diary_emp_id,
        d.diary_comment,
        d.diary_corevalue,
        d.createdDate,
        e.emp_name_en AS recipient_name,
        em.email AS recipient_email,
        em.position AS recipient_position
        ,e.location_emp AS recipient_branch
        ,sender.emp_name_en AS sender_name
      FROM tb_diary_list d
      LEFT JOIN tb_employee_list e
        ON d.diary_emp_id = e.fs_id
      LEFT JOIN tb_emp_email em
        ON d.diary_emp_id = em.Code
      LEFT JOIN tb_employee_list sender
        ON d.createdBy = sender.fs_id
      WHERE d.createdBy = ? AND YEAR(d.createdDate) >= YEAR(CURRENT_DATE) - 2
      ORDER BY d.createdDate DESC, d.diary_list DESC
      `,
      [currentUserId]
    );

    const data = rows.map((row) => {
      const fallbackName = row.diary_emp_id ? `Employee #${row.diary_emp_id}` : "Unknown employee";
      const fullName = row.recipient_name?.trim() || fallbackName;
      const { firstName, lastName } = splitName(fullName);
      const createdDate = row.createdDate ? new Date(row.createdDate) : null;

      return {
        id: String(row.diary_list),
        recipient: {
          user_id: row.diary_emp_id ? String(row.diary_emp_id) : "",
          firstName,
          lastName,
          email: row.recipient_email || "",
          role: row.recipient_position || undefined,
          branch: row.recipient_branch?.trim() || undefined,
        },
        senderName: row.sender_name?.trim() || String(currentUserId),
        comment: row.diary_comment || "",
        coreValues: row.diary_corevalue
          ? row.diary_corevalue.split(",").map((value) => value.trim()).filter(Boolean)
          : [],
        createdDate: createdDate ? createdDate.toISOString() : null,
        year: createdDate ? createdDate.getFullYear() : null,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

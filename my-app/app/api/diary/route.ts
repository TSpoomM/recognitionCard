import { pool } from "@/app/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import { EmailService } from "@/app/services/email/EmailService";
import { getRequestCurrentUserId, isSameUserId } from "@/app/lib/currentUser";

type EmployeeEmailRow = RowDataPacket & {
  emp_name_en: string | null;
  email: string | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { diary_emp_id, diary_comment, diary_corevalue } = body;
    const createdBy = await getRequestCurrentUserId(request, body);

    if (!diary_emp_id || !diary_comment || !createdBy) {
      return NextResponse.json(
        { success: false, error: "diary_emp_id, diary_comment, and current user id are required." },
        { status: 400 }
      );
    }

    if (isSameUserId(diary_emp_id, createdBy)) {
      return NextResponse.json(
        { success: false, error: "You cannot recognize yourself." },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO tb_diary_list (diary_emp_id, diary_comment, createdBy, createdDate, diary_corevalue)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
      `,
      [diary_emp_id, diary_comment, createdBy, diary_corevalue || null]
    );

    // Look up employee info for the email
    let recipientName = `Employee #${diary_emp_id}`;
    let recipientEmail = "";
    let recognizedByName = String(createdBy);
    try {
      const [empRows] = await pool.query<EmployeeEmailRow[]>(
        `
        SELECT e.emp_name_en, em.email
        FROM tb_employee_list e
        LEFT JOIN tb_emp_email em ON e.fs_id = em.Code
        WHERE e.fs_id = ?
        `,
        [diary_emp_id]
      );
      if (empRows && empRows.length > 0) {
        recipientName = empRows[0].emp_name_en || recipientName;
        recipientEmail = empRows[0].email || "";
      }
    } catch (err) {
      console.error("Failed to query employee info for email: ", err);
    }

    try {
      const [senderRows] = await pool.query<EmployeeEmailRow[]>(
        `
        SELECT e.emp_name_en, em.email
        FROM tb_employee_list e
        LEFT JOIN tb_emp_email em ON e.fs_id = em.Code
        WHERE e.fs_id = ?
        `,
        [createdBy]
      );
      if (senderRows && senderRows.length > 0) {
        recognizedByName = senderRows[0].emp_name_en || recognizedByName;
      }
    } catch (err) {
      console.error("Failed to query sender info for email: ", err);
    }

    // Trigger email in the background so it does not block the API response
    if (recipientEmail || process.env.TEST_EMAIL_TO) {
      const coreValues = diary_corevalue
        ? diary_corevalue.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      EmailService.sendComplimentEmail({
        toEmail: recipientEmail,
        recipientName,
        recognizedByName,
        comment: diary_comment,
        coreValues,
      }).catch((emailErr) => {
        console.error("Failed to send compliment email:", emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Saved recognition card successfully.",
      insertedId: result.insertId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

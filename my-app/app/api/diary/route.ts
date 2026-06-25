import { pool } from "@/app/lib/db";
import { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";
import { sendComplimentEmail } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { diary_emp_id, diary_comment, diary_corevalue } = body;

    if (!diary_emp_id || !diary_comment) {
      return NextResponse.json(
        { success: false, error: "diary_emp_id and diary_comment are required." },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO tb_diary_list (diary_emp_id, diary_comment, createdDate, diary_corevalue)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?)
      `,
      [diary_emp_id, diary_comment, diary_corevalue || null]
    );

    // Look up employee info for the email
    let recipientName = `Employee #${diary_emp_id}`;
    let recipientEmail = "";
    try {
      const [empRows] = await pool.query<any[]>(
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

    // Trigger email in the background so it does not block the API response
    if (recipientEmail || process.env.TEST_EMAIL_TO) {
      const coreValues = diary_corevalue
        ? diary_corevalue.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      sendComplimentEmail({
        toEmail: recipientEmail,
        recipientName,
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

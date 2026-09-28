import { pool } from "@/app/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import { EmailService } from "@/app/services/email/EmailService";
import { isSameUserId } from "@/app/lib/auth/currentUser";
import { getRequestCurrentUserId } from "@/app/lib/auth/requestCurrentUser";
import { CardLanguage } from "@/app/types/cardLanguage";
import { invalidateCache } from "@/app/lib/serverCache";

type EmployeeEmailRow = RowDataPacket & {
  fs_id: string | number;
  emp_name_en: string | null;
  email: string | null;
  location_emp: string | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { diary_emp_id, diary_emp_ids, diary_comment, diary_preview, diary_corevalue } = body;
    const previewComment = typeof diary_preview === "string" && diary_preview.trim()
      ? diary_preview.trim()
      : diary_comment;
    const createdBy = await getRequestCurrentUserId(request);
    const cardLanguage: CardLanguage = body.cardLanguage === "th" ? "th" : "en";
    const recipientIds = Array.from(
      new Set(
        (Array.isArray(diary_emp_ids) ? diary_emp_ids : diary_emp_id ? [diary_emp_id] : [])
          .map((id) => String(id).trim())
          .filter(Boolean)
      )
    );

    if (recipientIds.length === 0 || !diary_comment || !createdBy) {
      return NextResponse.json(
        { success: false, error: "diary_emp_id or diary_emp_ids, diary_comment, and current user id are required." },
        { status: 400 }
      );
    }

    if (recipientIds.some((recipientId) => isSameUserId(recipientId, createdBy))) {
      return NextResponse.json(
        { success: false, error: "You cannot recognize yourself." },
        { status: 400 }
      );
    }

    const insertResults = await Promise.all(
      recipientIds.map(async (recipientId) => {
        const [result] = await pool.query<ResultSetHeader>(
          `
          INSERT INTO tb_diary_list (diary_emp_id, diary_comment, diary_preview, createdBy, createdDate, diary_corevalue)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
          `,
          [recipientId, diary_comment, previewComment, createdBy, diary_corevalue || null]
        );
        return result;
      })
    );

    invalidateCache("report:");

    // Look up employee info for the email
    let recipientName = recipientIds.map((recipientId) => `Employee #${recipientId}`).join(", ");
    let recipientEmails: string[] = [];
    let recipientDisplayName = recipientName;
    let recipientDisplayNames: string[] = [];
    let recognizedByName = String(createdBy);
    try {
      const [empRows] = await pool.query<EmployeeEmailRow[]>(
        `
        SELECT e.fs_id, e.emp_name_en, e.location_emp, em.email
        FROM tb_employee_list e
        LEFT JOIN tb_emp_email em ON e.fs_id = em.Code
        WHERE e.fs_id IN (?)
        `,
        [recipientIds]
      );
      if (empRows && empRows.length > 0) {
        const rowById = new Map(empRows.map((row) => [String(row.fs_id), row]));
        recipientName = recipientIds
          .map((recipientId) => rowById.get(recipientId)?.emp_name_en || `Employee #${recipientId}`)
          .join(", ");
        recipientEmails = recipientIds
          .map((recipientId) => rowById.get(recipientId)?.email || "")
          .filter(Boolean);
        recipientDisplayName = recipientIds.map((recipientId) => {
          const row = rowById.get(recipientId);
          const name = row?.emp_name_en || `Employee #${recipientId}`;
          return row?.location_emp ? `${name} (${row.location_emp})` : name;
        }).join(", ");
        recipientDisplayNames = recipientIds.map((recipientId) => {
          const row = rowById.get(recipientId);
          const name = row?.emp_name_en || `Employee #${recipientId}`;
          return row?.location_emp ? `${name} (${row.location_emp})` : name;
        });
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
    if (recipientEmails.length > 0 || process.env.TEST_EMAIL_TO) {
      const coreValues = diary_corevalue
        ? diary_corevalue.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      EmailService.sendComplimentEmail({
        toEmail: recipientEmails,
        recipientName,
        recipientDisplayName,
        recipientDisplayNames,
        recognizedByName,
        comment: previewComment,
        coreValues,
        cardLanguage,
      }).catch((emailErr) => {
        console.error("Failed to send compliment email:", emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Saved recognition card successfully.",
      insertedIds: insertResults.map((result) => result.insertId),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

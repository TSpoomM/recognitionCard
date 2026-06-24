import { pool } from "@/app/lib/db";
import { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";

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

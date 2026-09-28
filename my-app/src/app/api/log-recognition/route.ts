import { pool } from "@/src/lib/db";
import { getRequestCurrentUserId } from "@/src/lib/auth/requestCurrentUser";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const employeeId = await getRequestCurrentUserId(request);
    const action = typeof body.action === "string" ? body.action.trim() : "";

    if (!employeeId || !action) {
      return NextResponse.json(
        { success: false, error: "Employee id and action are required." },
        { status: 400 }
      );
    }

    await pool.execute(
      "INSERT INTO tb_logrecog (empId, action_RecogSys, createdDate) VALUES (?, ?, NOW())",
      [String(employeeId).slice(0, 20), action.slice(0, 255)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

import { pool } from "@/app/lib/db";
import { isDevAuthBypassEnabled } from "@/app/lib/auth/devAuth";
import { NextResponse } from "next/server";

// Local debug utility only — not wired into any UI. Disabled outside dev
// bypass mode so it can't be hit in production to probe DB connectivity/errors.
export async function GET() {
  if (!isDevAuthBypassEnabled) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  try {
    const [rows] = await pool.query("SELECT 1 AS test");

    return NextResponse.json({
      success: true,
      rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
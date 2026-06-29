import { adminAuthService } from "@/app/lib/adminAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId, isAdmin } = await adminAuthService.getAccess(request);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        isAdmin,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

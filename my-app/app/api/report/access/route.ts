import { adminAuthService } from "@/app/lib/auth/adminAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId, isAdmin, isBranchManager, branch, canAccessReport } =
      await adminAuthService.getAccess(request);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        isAdmin,
        isBranchManager,
        branch,
        canAccessReport,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

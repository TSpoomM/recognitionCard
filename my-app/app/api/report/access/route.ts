import { isUserAdmin } from "@/app/lib/adminAuth";
import { getRequestCurrentUserId } from "@/app/lib/currentUser";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const userId = await getRequestCurrentUserId(request);
    const isAdmin = await isUserAdmin(userId);

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

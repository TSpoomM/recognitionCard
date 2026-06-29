'use client';

export type ReportAccessResult = {
  userId: string;
  isAdmin: boolean;
};

export class ReportAccessClient {
  async getAccess(currentUserId: string): Promise<ReportAccessResult> {
    const response = await fetch(
      `/api/report/access?currentUserId=${encodeURIComponent(currentUserId)}`
    );
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Could not verify report access.");
    }

    return {
      userId: String(result.data?.userId || currentUserId),
      isAdmin: Boolean(result.data?.isAdmin),
    };
  }
}

export const reportAccessClient = new ReportAccessClient();

'use client';

import { withBasePath } from "../basePath";

export type ReportAccessResult = {
  userId: string;
  isAdmin: boolean;
  isBranchManager: boolean;
  branch: string | null;
  canAccessReport: boolean;
};

export class ReportAccessClient {
  async getAccess(currentUserId: string): Promise<ReportAccessResult> {
    const response = await fetch(withBasePath("/api/report/access"), {
      headers: {
        "x-current-user-id": currentUserId,
      },
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Could not verify report access.");
    }

    return {
      userId: String(result.data?.userId || currentUserId),
      isAdmin: Boolean(result.data?.isAdmin),
      isBranchManager: Boolean(result.data?.isBranchManager),
      branch: result.data?.branch ? String(result.data.branch) : null,
      canAccessReport: Boolean(result.data?.canAccessReport),
    };
  }
}

export const reportAccessClient = new ReportAccessClient();

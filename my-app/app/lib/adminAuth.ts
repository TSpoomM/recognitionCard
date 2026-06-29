import { pool } from "@/app/lib/db";
import { currentUserService } from "@/app/lib/currentUser";
import { RowDataPacket } from "mysql2";

type EmployeeRoleRow = RowDataPacket & {
  position: string | null;
};

export type AdminAccess = {
  userId: string;
  isAdmin: boolean;
};

export class AdminAuthService {
  private getAdminUserIds(): Set<string> {
    const raw = process.env.ADMIN_USER_IDS || "";
    return new Set(
      raw
        .split(",")
        .map((id) => currentUserService.normalizeUserId(id))
        .filter(Boolean)
    );
  }

  private isAdminPosition(position: string | null | undefined) {
    if (!position) return false;
    return /\badmin\b/i.test(position.trim());
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const normalizedId = currentUserService.normalizeUserId(userId);
    if (!normalizedId) return false;

    if (this.getAdminUserIds().has(normalizedId)) return true;

    try {
      const [rows] = await pool.query<EmployeeRoleRow[]>(
        `
        SELECT em.position
        FROM tb_employee_list e
        LEFT JOIN tb_emp_email em ON e.fs_id = em.Code
        WHERE e.fs_id = ?
        LIMIT 1
        `,
        [normalizedId]
      );

      return this.isAdminPosition(rows[0]?.position);
    } catch {
      return false;
    }
  }

  async getAccess(request: Request, body?: Record<string, unknown>): Promise<AdminAccess> {
    const userId = await currentUserService.getRequestCurrentUserId(request, body);
    const isAdmin = await this.isUserAdmin(userId);

    return { userId, isAdmin };
  }

  async requireAdmin(request: Request, body?: Record<string, unknown>): Promise<AdminAccess> {
    return this.getAccess(request, body);
  }
}

export const adminAuthService = new AdminAuthService();

export const isUserAdmin = (userId: string) => adminAuthService.isUserAdmin(userId);
export const requireAdmin = (request: Request, body?: Record<string, unknown>) =>
  adminAuthService.requireAdmin(request, body);

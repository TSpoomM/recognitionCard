import { pool } from "@/app/lib/db";
import { getRequestCurrentUserId, normalizeUserId } from "@/app/lib/currentUser";
import { RowDataPacket } from "mysql2";

type EmployeeRoleRow = RowDataPacket & {
  position: string | null;
};

function getAdminUserIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS || "";
  return new Set(
    raw
      .split(",")
      .map((id) => normalizeUserId(id))
      .filter(Boolean)
  );
}

function isAdminPosition(position: string | null | undefined) {
  if (!position) return false;
  return /\badmin\b/i.test(position.trim());
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const normalizedId = normalizeUserId(userId);
  if (!normalizedId) return false;

  if (getAdminUserIds().has(normalizedId)) return true;

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

    return isAdminPosition(rows[0]?.position);
  } catch {
    return false;
  }
}

export async function requireAdmin(request: Request, body?: Record<string, unknown>) {
  const userId = await getRequestCurrentUserId(request, body);
  const isAdmin = await isUserAdmin(userId);

  return { userId, isAdmin };
}

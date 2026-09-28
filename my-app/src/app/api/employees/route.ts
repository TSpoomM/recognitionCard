import { pool } from "@/src/lib/db";
import { DEV_AUTH_EMP_ID, isDevAuthBypassEnabled } from "@/src/lib/auth/devAuth";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { getOrSetCache } from "@/src/lib/serverCache";

const EMPLOYEES_CACHE_KEY = "employees:all";
const EMPLOYEES_CACHE_TTL_MS = 5 * 60_000;

type EmployeeRow = RowDataPacket & {
  fs_id: string | number;
  emp_name: string | null;
  emp_name_en: string | null;
  location_emp: string | null;
  position: string | null;
  email: string | null;
  branch_desc: string | null;
  branch_name_en: string | null;
};

function splitName(fullName: string) {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: firstName || fullName,
    lastName: rest.join(" "),
  };
}

export async function GET() {
  try {
    const data = await getOrSetCache(EMPLOYEES_CACHE_KEY, EMPLOYEES_CACHE_TTL_MS, async () => {
      const [rows] = await pool.query<EmployeeRow[]>(
        `
        SELECT
          e.fs_id,
          e.emp_name,
          e.emp_name_en,
          e.location_emp,
          em.position,
          em.email,
          b.branch_desc,
          b.branch_name_en
        FROM tb_employee_list e
        LEFT JOIN tb_emp_email em
          ON e.fs_id = em.Code
        LEFT JOIN tb_branch_emp b
          ON e.location_emp = b.branch_name
        ORDER BY e.emp_name_en ASC
        `
      );

      const employees = rows.map((row) => {
        const fullName = row.emp_name_en?.trim() || String(row.fs_id);
        const { firstName, lastName } = splitName(fullName);

        return {
          user_id: String(row.fs_id),
          firstName,
          lastName,
          thaiName: row.emp_name?.trim() || undefined,
          email: row.email || "",
          role: row.position || undefined,
          team: undefined,
          location: row.location_emp || undefined,
          branchDesc: row.branch_desc?.trim() || undefined,
          branchNameEn: row.branch_name_en?.trim() || undefined,
        };
      });

      // Only relevant during local dev testing (DEV_AUTH_BYPASS=true): make sure the
      // dev session's employee id is selectable even if it's missing from this DB.
      if (isDevAuthBypassEnabled && !employees.some((user) => user.user_id === DEV_AUTH_EMP_ID)) {
        employees.unshift({
          user_id: DEV_AUTH_EMP_ID,
          firstName: "Dev",
          lastName: "User",
          thaiName: undefined,
          email: "",
          role: undefined,
          team: undefined,
          location: undefined,
          branchDesc: undefined,
          branchNameEn: undefined,
        });
      }

      return employees;
    });

    return NextResponse.json({
      success: true,
      data,
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

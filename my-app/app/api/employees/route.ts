import { pool } from "@/app/lib/db";
import { TEST_CURRENT_USER } from "@/app/lib/currentUser";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

type EmployeeRow = RowDataPacket & {
  fs_id: string | number;
  emp_name_en: string | null;
  location_emp: string | null;
  position: string | null;
  email: string | null;
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
    const [rows] = await pool.query<EmployeeRow[]>(
      `
      SELECT
        e.fs_id,
        e.emp_name_en,
        e.location_emp,
        em.position,
        em.email
      FROM tb_employee_list e
      LEFT JOIN tb_emp_email em
        ON e.fs_id = em.Code
      ORDER BY e.emp_name_en ASC
      `
    );

    const data = rows.map((row) => {
      const fullName = row.emp_name_en?.trim() || String(row.fs_id);
      const { firstName, lastName } = splitName(fullName);

      return {
        user_id: String(row.fs_id),
        firstName,
        lastName,
        email: row.email || "",
        role: row.position || undefined,
        team: undefined,
        location: row.location_emp || undefined,        
      };
    });

    if (!data.some((user) => user.user_id === TEST_CURRENT_USER.user_id)) {
      data.unshift({
        ...TEST_CURRENT_USER,
        team: undefined,
      });
    }

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

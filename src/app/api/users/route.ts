import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const users = await sql`
      SELECT clerk_id, email, first_name, last_name, image_url, country, last_sign_in_at, created_at, updated_at
      FROM clerk_users
      ORDER BY created_at DESC
      LIMIT 200
    `;

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Users list error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

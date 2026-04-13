import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO client_errors (user_id, context, message, stack, user_agent, url, extra)
      VALUES (
        ${body.userId || null},
        ${(body.context || "unknown").slice(0, 200)},
        ${(body.message || "").slice(0, 2000)},
        ${(body.stack || "").slice(0, 5000)},
        ${(body.userAgent || "").slice(0, 500)},
        ${(body.url || "").slice(0, 500)},
        ${body.extra ? JSON.stringify(body.extra).slice(0, 5000) : null}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const errors = await sql`
      SELECT id, context, message, stack, user_agent, url, extra, created_at
      FROM client_errors
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ errors });
  } catch {
    return NextResponse.json({ errors: [] }, { status: 500 });
  }
}

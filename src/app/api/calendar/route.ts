import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured");
  }
  return neon(process.env.DATABASE_URL);
}

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month = req.nextUrl.searchParams.get("month");
  const year = req.nextUrl.searchParams.get("year");

  try {
    const sql = getDb();

    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      if (isNaN(m) || isNaN(y) || m < 1 || m > 12 || y < 2000 || y > 2100) {
        return NextResponse.json(
          { error: "Invalid month/year" },
          { status: 400 }
        );
      }

      const entries = await sql`
        SELECT id, title, description, platform, scheduled_date, color, created_at
        FROM calendar_entries
        WHERE user_id = ${userId}
          AND EXTRACT(MONTH FROM scheduled_date) = ${m}
          AND EXTRACT(YEAR FROM scheduled_date) = ${y}
        ORDER BY scheduled_date ASC
        LIMIT 200
      `;
      return NextResponse.json({ entries });
    }

    const entries = await sql`
      SELECT id, title, description, platform, scheduled_date, color, created_at
      FROM calendar_entries
      WHERE user_id = ${userId}
      ORDER BY scheduled_date ASC
      LIMIT 100
    `;
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("Calendar GET error:", err);
    return NextResponse.json({ error: "Failed to load entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    platform?: string;
    scheduled_date?: string;
    color?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, platform, scheduled_date, color } = body;

  if (!title || typeof title !== "string" || title.length > 200) {
    return NextResponse.json(
      { error: "Title is required (max 200 chars)" },
      { status: 400 }
    );
  }

  if (!scheduled_date || isNaN(Date.parse(scheduled_date))) {
    return NextResponse.json(
      { error: "Valid scheduled_date is required" },
      { status: 400 }
    );
  }

  const validPlatforms = ["instagram", "tiktok", "youtube"];
  const safePlatform = validPlatforms.includes(platform || "")
    ? platform
    : "youtube";

  const colorRegex = /^#[0-9a-fA-F]{6}$/;
  const safeColor = colorRegex.test(color || "") ? color : "#3B82F6";

  try {
    const sql = getDb();
    const result = await sql`
      INSERT INTO calendar_entries (user_id, title, description, platform, scheduled_date, color)
      VALUES (
        ${userId},
        ${title.slice(0, 200)},
        ${(description || "").slice(0, 500)},
        ${safePlatform},
        ${new Date(scheduled_date).toISOString()},
        ${safeColor}
      )
      RETURNING id, title, description, platform, scheduled_date, color, created_at
    `;
    return NextResponse.json({ entry: result[0] }, { status: 201 });
  } catch (err) {
    console.error("Calendar POST error:", err);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    const sql = getDb();
    const result = await sql`
      DELETE FROM calendar_entries
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Calendar DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

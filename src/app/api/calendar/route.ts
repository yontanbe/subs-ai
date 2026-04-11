import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month");
  const year = req.nextUrl.searchParams.get("year");

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const sql = getDb();
    let entries;

    if (month && year) {
      entries = await sql`
        SELECT * FROM calendar_entries
        WHERE EXTRACT(MONTH FROM scheduled_date) = ${Number(month)}
          AND EXTRACT(YEAR FROM scheduled_date) = ${Number(year)}
        ORDER BY scheduled_date ASC
      `;
    } else {
      entries = await sql`
        SELECT * FROM calendar_entries
        ORDER BY scheduled_date ASC
        LIMIT 100
      `;
    }

    return NextResponse.json({ entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

  const { title, description, platform, scheduled_date, color } =
    await req.json();

  if (!title || !scheduled_date) {
    return NextResponse.json(
      { error: "Title and scheduled_date are required" },
      { status: 400 }
    );
  }

  try {
    const sql = getDb();
    const result = await sql`
      INSERT INTO calendar_entries (title, description, platform, scheduled_date, color)
      VALUES (${title}, ${description || ""}, ${platform || "youtube"}, ${scheduled_date}, ${color || "#3B82F6"})
      RETURNING *
    `;
    return NextResponse.json({ entry: result[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Insert failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    const sql = getDb();
    await sql`DELETE FROM calendar_entries WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

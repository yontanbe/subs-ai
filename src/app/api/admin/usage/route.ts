import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@clerk/nextjs/server";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(req.nextUrl.searchParams.get("days") || "30");
  const sql = getDb();

  try {
    const summary = await sql`
      SELECT
        service,
        model,
        action,
        COUNT(*)::int as total_calls,
        SUM(tokens_in)::int as total_tokens_in,
        SUM(tokens_out)::int as total_tokens_out,
        SUM(cost_usd)::numeric(10,4) as total_cost,
        AVG(duration_ms)::int as avg_duration_ms,
        COUNT(*) FILTER (WHERE status = 'error')::int as errors
      FROM api_usage
      WHERE created_at > NOW() - make_interval(days => ${days})
      GROUP BY service, model, action
      ORDER BY total_cost DESC
    `;

    const dailyCost = await sql`
      SELECT
        DATE(created_at) as date,
        SUM(cost_usd)::numeric(10,4) as cost,
        COUNT(*)::int as calls
      FROM api_usage
      WHERE created_at > NOW() - make_interval(days => ${days})
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const recentErrors = await sql`
      SELECT service, model, action, error, created_at
      FROM api_usage
      WHERE status = 'error' AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const totals = await sql`
      SELECT
        SUM(cost_usd)::numeric(10,4) as total_cost,
        COUNT(*)::int as total_calls,
        SUM(tokens_in)::int as total_tokens_in,
        SUM(tokens_out)::int as total_tokens_out
      FROM api_usage
      WHERE created_at > NOW() - make_interval(days => ${days})
    `;

    return NextResponse.json({
      summary,
      dailyCost,
      recentErrors,
      totals: totals[0],
    });
  } catch (err) {
    console.error("Usage API error:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}

// Log a usage event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sql = getDb();
    await sql`
      INSERT INTO api_usage (user_id, service, model, action, tokens_in, tokens_out, cost_usd, duration_ms, status, error)
      VALUES (
        ${body.user_id || null},
        ${body.service},
        ${body.model || null},
        ${body.action},
        ${body.tokens_in || 0},
        ${body.tokens_out || 0},
        ${body.cost_usd || 0},
        ${body.duration_ms || 0},
        ${body.status || 'success'},
        ${body.error || null}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Usage log error:", err);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

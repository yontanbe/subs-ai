import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { neon } from "@neondatabase/serverless";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    last_sign_in_at: number | null;
    unsafe_metadata?: { country?: string };
  };
  type: string;
}

interface ClerkSessionEvent {
  data: {
    user_id: string;
  };
  type: string;
}

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(webhookSecret);
  let payload: ClerkUserEvent | ClerkSessionEvent;
  try {
    payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent | ClerkSessionEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sql = getDb();

  if (payload.type === "user.created" || payload.type === "user.updated") {
    const data = (payload as ClerkUserEvent).data;
    const email = data.email_addresses?.[0]?.email_address ?? null;
    const country = data.unsafe_metadata?.country ?? null;
    const lastSignIn = data.last_sign_in_at
      ? new Date(data.last_sign_in_at).toISOString()
      : null;

    await sql`
      INSERT INTO clerk_users (clerk_id, email, first_name, last_name, image_url, country, last_sign_in_at, updated_at)
      VALUES (${data.id}, ${email}, ${data.first_name}, ${data.last_name}, ${data.image_url}, ${country}, ${lastSignIn}, NOW())
      ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        country = COALESCE(EXCLUDED.country, clerk_users.country),
        last_sign_in_at = COALESCE(EXCLUDED.last_sign_in_at, clerk_users.last_sign_in_at),
        updated_at = NOW()
    `;
  }

  if (payload.type === "session.created") {
    const data = (payload as ClerkSessionEvent).data;
    await sql`
      UPDATE clerk_users
      SET last_sign_in_at = NOW(), updated_at = NOW()
      WHERE clerk_id = ${data.user_id}
    `;
  }

  if (payload.type === "user.deleted") {
    const data = (payload as ClerkUserEvent).data;
    await sql`DELETE FROM clerk_users WHERE clerk_id = ${data.id}`;
  }

  return NextResponse.json({ success: true });
}

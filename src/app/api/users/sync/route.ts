import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ limit: 100 });
    const sql = neon(process.env.DATABASE_URL!);

    for (const u of users) {
      const email = u.emailAddresses[0]?.emailAddress ?? null;
      const country = (u.unsafeMetadata?.country as string) ?? null;
      const lastSignIn = u.lastSignInAt
        ? new Date(u.lastSignInAt).toISOString()
        : null;

      await sql`
        INSERT INTO clerk_users (clerk_id, email, first_name, last_name, image_url, country, last_sign_in_at, updated_at)
        VALUES (${u.id}, ${email}, ${u.firstName}, ${u.lastName}, ${u.imageUrl}, ${country}, ${lastSignIn}, NOW())
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

    return NextResponse.json({ synced: users.length });
  } catch (err) {
    console.error("User sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

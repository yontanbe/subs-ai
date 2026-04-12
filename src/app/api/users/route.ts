import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ limit: 100 });

    const mapped = users.map((u) => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? null,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || null,
      imageUrl: u.imageUrl,
      createdAt: u.createdAt,
      lastSignInAt: u.lastSignInAt,
    }));

    return NextResponse.json({ users: mapped });
  } catch (err) {
    console.error("Users list error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

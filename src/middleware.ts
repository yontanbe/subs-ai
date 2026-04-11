export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/editor", "/calendar", "/api/calendar/:path*"],
};

import type { NextRequest } from "next/server";

const masterPassword = process.env.AI_DASHBOARD_PASSWORD;

export function middleware(request: NextRequest) {
  let cookie = request.cookies.get("masterPassword");

  if (!cookie || !cookie.value || cookie?.value !== masterPassword) {
    return Response.json(
      { success: false, message: "authentication failed" },
      { status: 401 },
    );
  }
}

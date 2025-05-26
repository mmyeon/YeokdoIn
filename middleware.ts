import { type NextRequest } from "next/server";
import { updateSession } from "./features/auth/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/training/:path*", "/settings/:path*"],
};

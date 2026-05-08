import { type NextRequest } from "next/server";
import { updateSession } from "./features/auth/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/training/programs/:path*",
    "/training/program-input/:path*",
    "/training/program-runner/:path*",
    "/settings/:path*",
  ],
};

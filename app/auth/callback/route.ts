import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import { REDIRECT_TO_KEY } from "@/routes";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get(REDIRECT_TO_KEY);

  if (code) {
    const supabase = await supabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && redirectTo) {
      const sanitizedRedirectTo = redirectTo.startsWith("/") ? redirectTo : "/";
      const absoluteRedirectUrl = new URL(
        sanitizedRedirectTo,
        requestUrl.origin,
      );

      return NextResponse.redirect(absoluteRedirectUrl.toString());
    } else {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth`);
    }
  }

  // code가 없는 경우 에러 처리
  return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_code`);
}

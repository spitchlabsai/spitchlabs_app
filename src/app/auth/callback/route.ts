// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // This completes the auth flow for magic links / OAuth
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/signin?error=callback", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/dashboard", new URL(request.url).origin));
}

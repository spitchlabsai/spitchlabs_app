// app/auth/signout/route.ts
// import { NextResponse } from "next/server";
// import { createSupabaseServerClient } from "@/lib/supabase/server";

// export async function POST() {
//   const supabase = await createSupabaseServerClient();
//   await supabase.auth.signOut();
//   return NextResponse.redirect(new URL("/signin", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
// }

// app/auth/signout/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Redirect to the public signin page
  // Add ?redirectedFrom=/ to avoid middleware loops if needed
  const redirectUrl = new URL(
    "/signin",
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  );
  redirectUrl.searchParams.set("redirectedFrom", "/"); // optional, middleware will clean it

  return NextResponse.redirect(redirectUrl);
}

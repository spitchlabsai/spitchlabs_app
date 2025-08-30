// middleware.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  // Initialize supabase with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set(name, value); // update request
          res = NextResponse.next();
          res.cookies.set({ name, value, ...options }); // update response
        },
        remove(name: string, options) {
          req.cookies.set(name, ""); // update request
          res = NextResponse.next();
          res.cookies.set({ name, value: "", ...options }); // update response
        },
      },
    }
  );

  // Refresh session if needed
  await supabase.auth.getUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Define all protected routes here
  const protectedRoutes = ["/", "/caller", "/agent", "/admin"];

  // Check if request path starts with any protected route
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/signin", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Optional: Redirect logged-in users away from auth pages
  if (
    (req.nextUrl.pathname === "/signin" ||
      req.nextUrl.pathname === "/signup") &&
    user
  ) {
    const redirectTo =
      req.nextUrl.searchParams.get("redirectedFrom") || "/";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

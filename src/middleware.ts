// middleware.ts
// import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import type { NextRequest } from "next/server";

// export default async function middleware(req: NextRequest) {
//   let res = NextResponse.next();

//   // Initialize supabase with cookies
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return req.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options) {
//           req.cookies.set(name, value); // update request
//           res = NextResponse.next();
//           res.cookies.set({ name, value, ...options }); // update response
//         },
//         remove(name: string, options) {
//           req.cookies.set(name, ""); // update request
//           res = NextResponse.next();
//           res.cookies.set({ name, value: "", ...options }); // update response
//         },
//       },
//     }
//   );

//   // Refresh session if needed
//   await supabase.auth.getUser();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // ✅ Define all protected routes here
//   const protectedRoutes = ["/", "/caller", "/agent", "/admin"];

//   // Check if request path starts with any protected route
//   const isProtected = protectedRoutes.some((route) =>
//     req.nextUrl.pathname.startsWith(route)
//   );

//   if (isProtected && !user) {
//     const redirectUrl = new URL("/signin", req.url);
//     redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // Optional: Redirect logged-in users away from auth pages
//   if (
//     (req.nextUrl.pathname === "/signin" ||
//       req.nextUrl.pathname === "/signup") &&
//     user
//   ) {
//     const redirectTo =
//       req.nextUrl.searchParams.get("redirectedFrom") || "/";
//     return NextResponse.redirect(new URL(redirectTo, req.url));
//   }

//   return res;
// }

// export const config = {
//   matcher: [
//     // Match all routes except static files and images
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };


// middleware.ts
// import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import type { NextRequest } from "next/server";

// export default async function middleware(req: NextRequest) {
//   let res = NextResponse.next();

//   // Initialize Supabase client with cookies
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return req.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options) {
//           req.cookies.set(name, value); // update request
//           res = NextResponse.next();
//           res.cookies.set({ name, value, ...options }); // update response
//         },
//         remove(name: string, options) {
//           req.cookies.set(name, ""); // update request
//           res = NextResponse.next();
//           res.cookies.set({ name, value: "", ...options }); // update response
//         },
//       },
//     }
//   );

//   // Get the current user
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Define all protected routes
//   const protectedRoutes = ["/", "/caller", "/agent", "/admin"];

//   const pathname = req.nextUrl.pathname;

//   // Check if request is for a protected route
//   const isProtected = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   // Redirect logged-out users from protected routes to signin
//   if (isProtected && !user) {
//     const redirectUrl = new URL("/signin", req.url);
//     redirectUrl.searchParams.set("redirectedFrom", pathname);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // Redirect logged-in users away from auth pages (signin/signup)
//   const authPages = ["/signin", "/signup"];
//   if (authPages.includes(pathname) && user) {
//     const redirectTo = req.nextUrl.searchParams.get("redirectedFrom") || "/";
    
//     // Prevent redirect loop: only redirect if not already on that page
//     if (redirectTo !== pathname) {
//       const newUrl = new URL(redirectTo, req.url);
//       newUrl.searchParams.delete("redirectedFrom"); // clean query param
//       return NextResponse.redirect(newUrl);
//     }
//   }

//   return res;
// }

// // Match all routes except static files, images, and _next
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set(name, value);
          res = NextResponse.next();
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          req.cookies.set(name, "");
          res = NextResponse.next();
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;

  // Skip middleware for API routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    return res;
  }

  // Public paths that don't require auth
  const publicPaths = ["/signin", "/signup", "/landing"];
  const isPublicPath = publicPaths.includes(pathname);

  // Check if this is a redirect from signout (to prevent loops)
  const redirectedFrom = req.nextUrl.searchParams.get('redirectedFrom');
  
  // Protected routes
  const protectedRoutes = ["/", "/caller", "/agent", "/admin"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected pages to signin
  if (isProtected && !user && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Only redirect authenticated users away from auth pages if they didn't come from signout
  if (user && isPublicPath && !redirectedFrom) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
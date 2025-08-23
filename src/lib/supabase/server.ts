// lib/supabase/server.ts
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { type CookieOptions } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: {
          "x-forwarded-host": headerStore.get("x-forwarded-host") ?? "",
          "x-forwarded-proto": headerStore.get("x-forwarded-proto") ?? "",
        },
      },
    }
  )
}
"use client";

import { PropsWithChildren, useMemo, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Providers({ children }: PropsWithChildren) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const lastUserId = useRef<string | null>(null);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip the initial INITIAL_SESSION event to prevent refresh on page load
      if (!isInitialized.current && event === 'INITIAL_SESSION') {
        isInitialized.current = true;
        lastUserId.current = session?.user?.id || null;
        return;
      }

      const currentUserId = session?.user?.id || null;
      
      // Only refresh if user actually changed (signed in/out or switched users)
      if (currentUserId !== lastUserId.current) {
        lastUserId.current = currentUserId;
        
        // Clear any pending refresh
        if (refreshTimeout.current) {
          clearTimeout(refreshTimeout.current);
        }
        
        // Debounce the refresh to prevent multiple rapid refreshes
        refreshTimeout.current = setTimeout(() => {
          router.refresh();
        }, 100);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [supabase, router]);

  return <>{children}</>;
}
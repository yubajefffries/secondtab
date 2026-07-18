"use client";

import { createBrowserClient } from "@supabase/ssr";

// Demo mode: when the instance is not provisioned, the app renders demo data
// and never attempts a network call. isDemoMode is checked before any query.
export const isDemoMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (isDemoMode) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see SETUP.md)."
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

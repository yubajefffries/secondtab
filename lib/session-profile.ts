import "server-only";
import { redirect } from "next/navigation";
import { createClient, isDemoMode } from "@/lib/supabase/server";
import { currentUser } from "@/lib/demo-data";

export interface SessionProfile {
  name: string;
  email: string;
}

export async function getSessionProfile(): Promise<SessionProfile> {
  if (isDemoMode) return { name: currentUser.name, email: currentUser.email };

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error("Unable to load your profile.");

  return {
    name: profile?.full_name?.trim() || profile?.email || user.email || "Account",
    email: profile?.email || user.email || "",
  };
}

import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/server";

export default function Home() {
  redirect(isDemoMode ? "/dashboard" : "/leads");
}

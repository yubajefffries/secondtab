import type { Metadata } from "next";
import { ContactsView } from "./contacts-view";
import { fetchPeople } from "@/lib/live-data";
import { isDemoMode } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  // Provisioned instances read the real people table (RLS-gated); demo mode
  // keeps the in-memory sample store.
  const livePeople = isDemoMode ? undefined : await fetchPeople();
  return <ContactsView livePeople={livePeople} />;
}

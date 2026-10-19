import "server-only";
import { createClient, isDemoMode } from "@/lib/supabase/server";
import type { Person } from "@/lib/demo-data";

// Live reads for a provisioned instance. Every query runs as the signed-in
// user through the anon key + session cookie, so RLS (is_active_user) is the
// only gate. No service-role key is used here.

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string | null;
  status: string;
  topic: string | null;
  createdAt: string;
}

interface LeadRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  message: string | null;
  source: string | null;
  status: string;
  custom: Record<string, unknown> | null;
  created_at: string;
}

export function mapLead(row: LeadRow): Lead {
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  const topic = row.custom && typeof row.custom.topic === "string" ? row.custom.topic : null;
  return {
    id: row.id,
    name: name || row.email || "Unnamed lead",
    email: row.email,
    phone: row.phone,
    company: row.company_name,
    message: row.message,
    source: row.source,
    status: row.status,
    topic,
    createdAt: row.created_at,
  };
}

export async function fetchLeads(): Promise<Lead[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, company_name, message, source, status, custom, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Unable to load leads.");
  return (data as LeadRow[]).map(mapLead);
}

interface PersonRow {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  updated_at: string;
}

export async function fetchPeople(): Promise<Person[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, first_name, last_name, email, phone, title, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Unable to load contacts.");
  return (data as PersonRow[]).map((p) => ({
    id: p.id,
    name: [p.first_name, p.last_name].filter(Boolean).join(" "),
    email: p.email ?? "",
    phone: p.phone ?? "",
    title: p.title ?? "",
    company: "",
    owner: "",
    lastActivity: formatDate(p.updated_at),
    tags: [],
  }));
}

/** Instance display timezone (server env INSTANCE_TIMEZONE, IANA name). */
export function formatDate(iso: string, withTime = false): string {
  const timeZone = process.env.INSTANCE_TIMEZONE || "UTC";
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", timeZoneName: "short" } : {}),
  }).format(new Date(iso));
}

import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { fetchLeads, formatDate } from "@/lib/live-data";
import { isDemoMode } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const statusVariant: Record<string, "brand" | "info" | "success" | "neutral" | "danger"> = {
  new: "brand",
  working: "info",
  qualified: "success",
  converted: "success",
  disqualified: "neutral",
};

function label(s: string) {
  return s.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default async function LeadsPage() {
  const leads = await fetchLeads();

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted">
          {isDemoMode
            ? "Leads from your website forms appear here once the instance is connected to Supabase."
            : `${leads.length} ${leads.length === 1 ? "lead" : "leads"} · newest first · inquiries from your website land here automatically`}
        </p>
      </div>

      {leads.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          {isDemoMode ? (
            "Demo mode has no live leads."
          ) : (
            <>No leads yet. When someone submits your website&apos;s contact form, they&apos;ll show up here.</>
          )}
        </Card>
      ) : (
        <>
          {/* Phone: cards */}
          <ul className="space-y-3 md:hidden">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={lead.name} />
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-muted">{formatDate(lead.createdAt, true)}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[lead.status] ?? "neutral"}>{label(lead.status)}</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-secondary">
                    {lead.email && <p><a href={`mailto:${lead.email}`} className="hover:text-brand">{lead.email}</a></p>}
                    {lead.phone && <p className="tabular-nums"><a href={`tel:${lead.phone}`} className="hover:text-brand">{lead.phone}</a></p>}
                    {lead.topic && <p>Interested in: {label(lead.topic)}</p>}
                    {lead.message && <p className="whitespace-pre-line text-foreground">{lead.message}</p>}
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Interested in</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border align-top last:border-0 hover:bg-hover">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-medium">
                        <Avatar name={lead.name} />
                        <span>
                          {lead.name}
                          {lead.source && <span className="block text-xs font-normal text-muted">{label(lead.source)}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-brand">{lead.email}</a> : "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary tabular-nums">
                      {lead.phone ? <a href={`tel:${lead.phone}`} className="hover:text-brand">{lead.phone}</a> : "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary">{lead.topic ? label(lead.topic) : "—"}</td>
                    <td className="max-w-sm px-4 py-3 text-secondary">
                      <span className="line-clamp-3 whitespace-pre-line">{lead.message || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[lead.status] ?? "neutral"}>{label(lead.status)}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(lead.createdAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {!isDemoMode && (
        <p className="text-xs text-muted">
          Converting a lead into a contact is coming next. For now, reply by email or phone straight from this list, or
          see <Link href="/contacts" className="text-brand hover:underline">Contacts</Link>.
        </p>
      )}
    </div>
  );
}

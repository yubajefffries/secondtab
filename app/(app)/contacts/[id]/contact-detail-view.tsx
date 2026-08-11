"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RecordDetail } from "@/components/record-detail";
import { useDemoStore } from "@/lib/demo-store";

// Reads through the demo store (not the static dataset) so contacts created
// in this session resolve here too. Seeded contacts keep the rich showcase
// data; session-created ones start with a bare timeline.
export function ContactDetailView({ id }: { id: string }) {
  const { people } = useDemoStore();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <Card className="p-8 text-center">
          <h1 className="text-lg font-semibold">Contact not found</h1>
          <p className="mt-1 text-sm text-muted">
            This contact doesn&apos;t exist, or it was created in a demo session
            that has ended.
          </p>
          <Link
            href="/contacts"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to contacts
          </Link>
        </Card>
      </div>
    );
  }

  const isSeed = !person.id.startsWith("p-new-");
  const subtitle =
    [person.title, person.company].filter(Boolean).join(" · ") || "No details yet";

  const role =
    person.title && person.company
      ? `${person.title} at ${person.company}.`
      : person.title
        ? `${person.title}.`
        : person.company
          ? `Works at ${person.company}.`
          : "";
  const reachable = [person.email, person.phone].filter(Boolean).join(" or ");
  const aboutBody =
    [role, reachable && `Reachable at ${reachable}.`, isSeed && "Prefers email for follow-ups."]
      .filter(Boolean)
      .join(" ") || "Nothing here yet — details you add will show up here.";

  return (
    <RecordDetail
      backHref="/contacts"
      backLabel="Contacts"
      name={person.name}
      subtitle={subtitle}
      status={{
        label: person.tags[0] ?? "Contact",
        tone: person.tags.includes("Customer") ? "success" : "brand",
      }}
      owner={person.owner}
      dealValue={isSeed ? 94500 : undefined}
      closeDate={isSeed ? "May 30, 2025" : undefined}
      about={{ title: `About ${person.name.split(" ")[0]}`, body: aboutBody }}
      activity={
        isSeed
          ? [
              { title: "Email opened · Proposal Follow-up", meta: `${person.owner} · May 24, 8:42 AM` },
              { title: "Deal moved to Qualified", meta: `${person.owner} · May 20, 10:15 AM` },
            ]
          : [{ title: "Contact created", meta: `${person.owner} · Just now` }]
      }
      tasks={
        isSeed
          ? [
              { title: "Follow up with James", due: "Today", priority: "High" },
              { title: "Send proposal", due: "Tomorrow", priority: "Medium" },
            ]
          : []
      }
      financials={
        isSeed
          ? [
              { label: "Estimate", number: "#EST-1024", status: "Accepted", statusTone: "success", amount: 94500, meta: "Sent May 18, 2025" },
              { label: "Invoice", number: "#INV-1007", status: "Sent", statusTone: "info", amount: 47250, meta: "Due Jun 1, 2025" },
            ]
          : []
      }
      communications={
        isSeed
          ? [
              { subject: "Proposal for Custom Home Project", meta: `May 20, 2025 · From: ${person.owner}` },
              { subject: "Intro Call Summary", meta: `May 18, 2025 · From: ${person.owner}` },
            ]
          : []
      }
    />
  );
}

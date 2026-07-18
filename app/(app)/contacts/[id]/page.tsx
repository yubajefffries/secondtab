import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordDetail } from "@/components/record-detail";
import { people } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = people.find((p) => p.id === id);
  if (!person) notFound();

  return (
    <RecordDetail
      backHref="/contacts"
      backLabel="Contacts"
      name={person.name}
      subtitle={`${person.title} · ${person.company}`}
      status={{ label: person.tags[0] ?? "Contact", tone: person.tags.includes("Customer") ? "success" : "brand" }}
      owner={person.owner}
      dealValue={94500}
      closeDate="May 30, 2025"
      about={{
        title: `About ${person.name.split(" ")[0]}`,
        body: `${person.title} at ${person.company}. Reachable at ${person.email} or ${person.phone}. Prefers email for follow-ups.`,
      }}
      activity={[
        { title: "Email opened · Proposal Follow-up", meta: `${person.owner} · May 24, 8:42 AM` },
        { title: "Deal moved to Qualified", meta: `${person.owner} · May 20, 10:15 AM` },
      ]}
      tasks={[
        { title: "Follow up with James", due: "Today", priority: "High" },
        { title: "Send proposal", due: "Tomorrow", priority: "Medium" },
      ]}
      financials={[
        { label: "Estimate", number: "#EST-1024", status: "Accepted", statusTone: "success", amount: 94500, meta: "Sent May 18, 2025" },
        { label: "Invoice", number: "#INV-1007", status: "Sent", statusTone: "info", amount: 47250, meta: "Due Jun 1, 2025" },
      ]}
      communications={[
        { subject: "Proposal for Custom Home Project", meta: `May 20, 2025 · From: ${person.owner}` },
        { subject: "Intro Call Summary", meta: `May 18, 2025 · From: ${person.owner}` },
      ]}
    />
  );
}

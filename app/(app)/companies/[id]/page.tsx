import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordDetail } from "@/components/record-detail";
import { companies } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Company" };

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = companies.find((c) => c.id === id);
  if (!company) notFound();

  return (
    <RecordDetail
      backHref="/companies"
      backLabel="Companies"
      name={company.name}
      subtitle={`${company.status} · ${company.industry}`}
      status={{ label: "Qualified", tone: "brand" }}
      owner={company.owner}
      dealValue={company.totalValue}
      closeDate="May 30, 2025"
      about={{
        title: `About ${company.name}`,
        body: `${company.industry} company · ${company.domain} · ${company.phone}. ${company.people} linked ${company.people === 1 ? "contact" : "contacts"} and ${company.openDeals} open ${company.openDeals === 1 ? "deal" : "deals"}.`,
      }}
      activity={[
        { title: "Email opened · Proposal Follow-up", meta: `${company.owner} · May 24, 8:42 AM` },
        { title: "Deal moved to Qualified", meta: `${company.owner} · May 20, 10:15 AM` },
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
        { subject: "Proposal for Custom Home Project", meta: `May 20, 2025 · From: ${company.owner}` },
        { subject: "Intro Call Summary", meta: `May 18, 2025 · From: ${company.owner}` },
      ]}
    />
  );
}

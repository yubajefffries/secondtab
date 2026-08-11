import type { Metadata } from "next";
import { ContactDetailView } from "./contact-detail-view";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactDetailView id={id} />;
}

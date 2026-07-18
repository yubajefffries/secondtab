import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Download, Upload, ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { people } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Contacts" };

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted">{people.length} people · All contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Upload /> Import CSV
          </Button>
          <Button variant="secondary">
            <Download /> Export
          </Button>
          <Button variant="primary">
            <Plus /> New contact
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted" aria-hidden />
          <Input placeholder="Filter contacts..." className="pl-8" />
        </div>
        <Button variant="secondary" size="sm">
          Owner: Anyone <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm">
          Tags: All <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm">
          Saved views <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-175 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" aria-label="Select all contacts" className="size-4 accent-[var(--brand)]" />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-border last:border-0 hover:bg-hover">
                <td className="px-4 py-3">
                  <input type="checkbox" aria-label={`Select ${person.name}`} className="size-4 accent-[var(--brand)]" />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/contacts/${person.id}`} className="flex items-center gap-2.5 font-medium hover:text-brand">
                    <Avatar name={person.name} />
                    <span>
                      {person.name}
                      <span className="block text-xs font-normal text-muted">{person.title}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{person.company}</td>
                <td className="px-4 py-3 text-secondary">{person.email}</td>
                <td className="px-4 py-3 text-secondary tabular-nums">{person.phone}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    {person.tags.map((t) => (
                      <Badge key={t} variant={t === "Customer" ? "success" : "brand"}>{t}</Badge>
                    ))}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{person.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

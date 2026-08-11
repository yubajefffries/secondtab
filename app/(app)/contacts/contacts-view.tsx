"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Download, Upload, ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useDemoStore } from "@/lib/demo-store";

export function ContactsView() {
  const { people, setNewContactOpen } = useDemoStore();
  const [filter, setFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const query = filter.trim().toLowerCase();
  const visible = query
    ? people.filter((p) =>
        [p.name, p.company, p.email, p.title]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : people;

  const allVisibleSelected =
    visible.length > 0 && visible.every((p) => selected.has(p.id));

  function toggleAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visible.forEach((p) => next.delete(p.id));
        return next;
      }
      return new Set([...prev, ...visible.map((p) => p.id)]);
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted">
            {selected.size > 0
              ? `${selected.size} of ${people.length} selected`
              : `${people.length} people · All contacts`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled title="CSV import ships with live data wiring">
            <Upload /> Import CSV
          </Button>
          <Button variant="secondary" disabled title="Export ships with live data wiring">
            <Download /> Export
          </Button>
          <Button variant="primary" onClick={() => setNewContactOpen(true)}>
            <Plus /> New contact
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted" aria-hidden />
          <Input
            placeholder="Filter contacts..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter contacts"
          />
        </div>
        <Button variant="secondary" size="sm" disabled title="Owner filter ships with live data wiring">
          Owner: Anyone <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm" disabled title="Tag filter ships with live data wiring">
          Tags: All <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm" disabled title="Saved views ship with live data wiring">
          Saved views <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-175 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all contacts"
                  className="size-4 accent-[var(--brand)]"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                />
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
            {visible.map((person) => (
              <tr key={person.id} className="border-b border-border last:border-0 hover:bg-hover">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${person.name}`}
                    className="size-4 accent-[var(--brand)]"
                    checked={selected.has(person.id)}
                    onChange={() => toggleOne(person.id)}
                  />
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
                <td className="px-4 py-3 text-secondary">
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="hover:text-brand">{person.email}</a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-secondary tabular-nums">
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="hover:text-brand">{person.phone}</a>
                  ) : (
                    "—"
                  )}
                </td>
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                  No contacts match &ldquo;{filter}&rdquo;. Clear the filter or create a new
                  contact.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

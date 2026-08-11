"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Download, Upload, ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companies } from "@/lib/demo-data";
import { formatCurrency, initials } from "@/lib/utils";

const statusTone = { Customer: "success", Prospect: "brand", Partner: "info" } as const;

export function CompaniesView() {
  const [filter, setFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const query = filter.trim().toLowerCase();
  const visible = query
    ? companies.filter((c) =>
        [c.name, c.domain, c.industry, c.status].join(" ").toLowerCase().includes(query)
      )
    : companies;

  const allVisibleSelected =
    visible.length > 0 && visible.every((c) => selected.has(c.id));

  function toggleAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visible.forEach((c) => next.delete(c.id));
        return next;
      }
      return new Set([...prev, ...visible.map((c) => c.id)]);
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
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted">
            {selected.size > 0
              ? `${selected.size} of ${companies.length} selected`
              : `${companies.length} companies · All companies`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled title="CSV import ships with live data wiring">
            <Upload /> Import CSV
          </Button>
          <Button variant="secondary" disabled title="Export ships with live data wiring">
            <Download /> Export
          </Button>
          <Button variant="primary" disabled title="Company creation ships with live data wiring">
            <Plus /> New company
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted" aria-hidden />
          <Input
            placeholder="Filter companies..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter companies"
          />
        </div>
        <Button variant="secondary" size="sm" disabled title="Industry filter ships with live data wiring">
          Industry: All <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm" disabled title="Status filter ships with live data wiring">
          Status: All <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-175 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all companies"
                  className="size-4 accent-[var(--brand)]"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Open deals</th>
              <th className="px-4 py-3 text-right">Total value</th>
              <th className="px-4 py-3 text-right">People</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((company) => (
              <tr key={company.id} className="border-b border-border last:border-0 hover:bg-hover">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${company.name}`}
                    className="size-4 accent-[var(--brand)]"
                    checked={selected.has(company.id)}
                    onChange={() => toggleOne(company.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${company.id}`} className="flex items-center gap-2.5 font-medium hover:text-brand">
                    <span className="flex size-8 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand">
                      {initials(company.name)}
                    </span>
                    <span>
                      {company.name}
                      <span className="block text-xs font-normal text-muted">{company.domain}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{company.industry}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusTone[company.status]}>{company.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{company.openDeals}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatCurrency(company.totalValue)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{company.people}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                  No companies match &ldquo;{filter}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

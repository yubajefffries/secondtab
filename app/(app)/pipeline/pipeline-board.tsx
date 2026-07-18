"use client";

import * as React from "react";
import {
  Handshake,
  DollarSign,
  BarChart3,
  CalendarClock,
  Trophy,
  Zap,
  Download,
  MoreHorizontal,
  ChevronDown,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Search,
  Undo2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  stages,
  deals as initialDeals,
  type Deal,
  type StageKey,
} from "@/lib/demo-data";
import { cn, formatCurrency, formatCompactCurrency, initials } from "@/lib/utils";

const stats = [
  { icon: Handshake, label: "Total Deals", value: "87", delta: "12% vs last month", up: true, tone: "bg-brand-soft text-brand" },
  { icon: DollarSign, label: "Pipeline Value", value: "$2.48M", delta: "18% vs last month", up: true, tone: "bg-success-soft text-success" },
  { icon: BarChart3, label: "Weighted Value", value: "$1.36M", delta: "16% vs last month", up: true, tone: "bg-brand-soft text-accent" },
  { icon: CalendarClock, label: "Avg. Deal Age", value: "34 days", delta: "5 days vs last month", up: false, tone: "bg-warning-soft text-warning" },
  { icon: Trophy, label: "Win Rate", value: "24%", delta: "4% vs last month", up: true, tone: "bg-warning-soft text-warning" },
];

const filterGroups = [
  { label: "Owners", value: "All owners" },
  { label: "Deal type", value: "All types" },
  { label: "Lead source", value: "All sources" },
  { label: "Tags", value: "All tags" },
  { label: "Close date", value: "This quarter" },
  { label: "Deal value", value: "Any value" },
];

const toneToBadge = {
  brand: "brand",
  info: "info",
  warning: "warning",
  success: "success",
  neutral: "neutral",
  danger: "danger",
} as const;

interface Move {
  dealId: string;
  from: StageKey;
  to: StageKey;
}

export function PipelineBoard() {
  const [deals, setDeals] = React.useState<Deal[]>(initialDeals);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overStage, setOverStage] = React.useState<StageKey | null>(null);
  const [lastMove, setLastMove] = React.useState<Move | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(true);
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const byStage = (stage: StageKey) => deals.filter((d) => d.stage === stage);
  const stageValue = (stage: StageKey) =>
    byStage(stage).reduce((sum, d) => sum + d.value, 0);

  function moveDeal(dealId: string, to: StageKey) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === to) return;
    const from = deal.stage;
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: to } : d)));
    setLastMove({ dealId, from, to });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setLastMove(null), 6000);
  }

  function undo() {
    if (!lastMove) return;
    setDeals((prev) =>
      prev.map((d) => (d.id === lastMove.dealId ? { ...d, stage: lastMove.from } : d))
    );
    setLastMove(null);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <Button variant="secondary" size="sm">
            Sales Pipeline <ChevronDown className="!size-3.5 opacity-70" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Zap /> Automations
          </Button>
          <Button variant="secondary">
            <Download /> Export
          </Button>
          <Button variant="secondary" size="icon" aria-label="Pipeline options">
            <MoreHorizontal />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pipeline">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              Group by: Stage <ChevronDown className="!size-3.5 opacity-70" />
            </Button>
            <Button variant="secondary" size="sm">
              Sort by: Next step <ChevronDown className="!size-3.5 opacity-70" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Toggle filters"
              aria-pressed={filtersOpen}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal />
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <span className={cn("flex size-9 items-center justify-center rounded-lg", s.tone)}>
                  <s.icon className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="text-xl font-bold tracking-tight">{s.value}</p>
                </div>
              </div>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs font-medium",
                  s.up ? "text-success" : "text-danger"
                )}
              >
                {s.up ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
                {s.delta}
              </p>
            </Card>
          ))}
        </div>

        <TabsContent value="pipeline">
          <div className="flex gap-4">
            {/* Filters */}
            {filtersOpen && (
              <Card className="hidden w-56 shrink-0 self-start p-4 lg:block">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Filters</p>
                  <button className="text-xs font-medium text-brand hover:underline">
                    Clear all
                  </button>
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted" aria-hidden />
                  <Input placeholder="Search filters..." className="pl-8" />
                </div>
                <div className="mt-3 space-y-3">
                  {filterGroups.map((g) => (
                    <div key={g.label}>
                      <p className="mb-1 text-xs font-medium text-muted">{g.label}</p>
                      <Button variant="secondary" size="sm" className="w-full justify-between font-normal">
                        {g.value} <ChevronDown className="!size-3.5 opacity-70" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" className="mt-4 w-full">
                  <Plus /> Add filter
                </Button>
                <Button variant="secondary" size="sm" className="mt-2 w-full">
                  Save view
                </Button>
              </Card>
            )}

            {/* Board */}
            <div className="flex flex-1 gap-3 overflow-x-auto pb-3 thin-scroll" role="list" aria-label="Pipeline stages">
              {stages.map((stage) => {
                const items = byStage(stage.id);
                return (
                  <section
                    key={stage.id}
                    role="listitem"
                    aria-label={`${stage.name} stage`}
                    className={cn(
                      "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface",
                      overStage === stage.id && "ring-2 ring-focus"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverStage(stage.id);
                    }}
                    onDragLeave={() => setOverStage(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setOverStage(null);
                      const id = e.dataTransfer.getData("text/plain") || dragId;
                      if (id) moveDeal(id, stage.id);
                    }}
                  >
                    <div
                      className="rounded-t-lg border-b border-border px-3 py-2.5"
                      style={{ borderTop: `3px solid var(--${stage.color})` }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {stage.name}{" "}
                          <span className="font-normal text-muted">({items.length})</span>
                        </p>
                        <span className="text-xs font-medium text-muted tabular-nums">
                          {formatCompactCurrency(stageValue(stage.id))}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 thin-scroll">
                      {items.map((deal) => (
                        <article
                          key={deal.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", deal.id);
                            setDragId(deal.id);
                          }}
                          onDragEnd={() => setDragId(null)}
                          tabIndex={0}
                          aria-label={`${deal.company}, ${formatCurrency(deal.value)}, stage ${stage.name}`}
                          onKeyDown={(e) => {
                            // keyboard-accessible alternative to drag (PRD §18.3)
                            const idx = stages.findIndex((s) => s.id === deal.stage);
                            if (e.key === "ArrowRight" && idx < stages.length - 1) {
                              e.preventDefault();
                              moveDeal(deal.id, stages[idx + 1].id);
                            }
                            if (e.key === "ArrowLeft" && idx > 0) {
                              e.preventDefault();
                              moveDeal(deal.id, stages[idx - 1].id);
                            }
                          }}
                          className={cn(
                            "cursor-grab rounded-lg border border-border bg-elevated p-3 shadow-card transition-shadow hover:shadow-pop",
                            dragId === deal.id && "opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand">
                              {initials(deal.company)}
                            </span>
                            <div className="min-w-0 flex-1 leading-tight">
                              <p className="truncate text-sm font-semibold">{deal.company}</p>
                              <p className="truncate text-xs text-muted">{deal.contact}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-bold text-brand">
                            {formatCurrency(deal.value)}
                          </p>
                          {deal.closedOn ? (
                            <p className="mt-1.5 text-xs text-muted">
                              Closed on
                              <span className="block text-sm text-secondary">{deal.closedOn}</span>
                            </p>
                          ) : (
                            <div className="mt-1.5 flex items-end justify-between gap-2">
                              <p className="min-w-0 text-xs text-muted">
                                Next step
                                <span className="block truncate text-sm text-secondary">
                                  {deal.nextStep}
                                </span>
                              </p>
                              <p className="flex shrink-0 items-center gap-1 text-xs text-muted">
                                <Calendar className="size-3.5" aria-hidden />
                                {deal.nextStepDate}
                              </p>
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            {deal.tag ? (
                              <Badge variant={toneToBadge[deal.tag.tone]}>{deal.tag.label}</Badge>
                            ) : (
                              <span />
                            )}
                            <Avatar name={deal.owner} size="sm" />
                          </div>
                        </article>
                      ))}

                      <button className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong py-2 text-sm font-medium text-muted hover:bg-hover hover:text-foreground">
                        <Plus className="size-4" aria-hidden /> Add deal
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
          <p className="mt-1 rounded-md border border-dashed border-border py-2 text-center text-xs text-muted">
            Drag and drop deals between stages to update · or focus a card and use ← →
          </p>
        </TabsContent>

        <TabsContent value="table">
          <Card className="overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="px-4 py-3">Deal</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3">Next step</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const stage = stages.find((s) => s.id === deal.stage)!;
                  return (
                    <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-hover">
                      <td className="px-4 py-3 font-medium">{deal.company}</td>
                      <td className="px-4 py-3 text-secondary">{deal.contact}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: `var(--${stage.color})` }}
                            aria-hidden
                          />
                          {stage.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(deal.value)}
                      </td>
                      <td className="px-4 py-3 text-secondary">{deal.nextStep || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <Avatar name={deal.owner} size="sm" /> {deal.owner}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card className="p-10 text-center">
            <p className="text-sm font-semibold">Forecast</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Weighted forecast by close date ships with the reporting phase. Stage
              probabilities are already configured on this pipeline.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card className="p-10 text-center">
            <p className="text-sm font-semibold">Analytics</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Conversion and velocity analytics ship with the reporting phase. See the
              Reports tab for the v1 dashboard.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Undo snackbar */}
      {lastMove && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-elevated px-4 py-2.5 shadow-pop md:bottom-6"
        >
          <span className="text-sm">
            Deal moved to{" "}
            <strong>{stages.find((s) => s.id === lastMove.to)?.name}</strong>
          </span>
          <Button variant="soft" size="sm" onClick={undo}>
            <Undo2 /> Undo
          </Button>
        </div>
      )}
    </div>
  );
}

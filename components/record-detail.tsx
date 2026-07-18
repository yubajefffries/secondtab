"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  StickyNote,
  CheckSquare,
  Pencil,
  ChevronDown,
  Activity as ActivityIcon,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, initials } from "@/lib/utils";

export interface RecordDetailProps {
  backHref: string;
  backLabel: string;
  name: string;
  subtitle: string;
  status: { label: string; tone: "brand" | "success" | "warning" | "neutral" };
  owner: string;
  dealValue?: number;
  closeDate?: string;
  about: { title: string; body: string };
  activity: { title: string; meta: string }[];
  tasks: { title: string; due: string; priority: "High" | "Medium" | "Low" }[];
  financials: {
    label: string;
    number: string;
    status: string;
    statusTone: "success" | "info" | "warning";
    amount: number;
    meta: string;
  }[];
  communications: { subject: string; meta: string }[];
}

const priorityTone = { High: "danger", Medium: "warning", Low: "info" } as const;

export function RecordDetail(props: RecordDetailProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link
          href={props.backHref}
          className="flex items-center gap-1.5 font-medium hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {props.backLabel}
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-success-soft text-xl font-bold text-success">
          {initials(props.name)}
        </span>
        <div className="min-w-0 flex-1">
          <Badge variant={props.status.tone} className="gap-1">
            {props.status.label} <ChevronDown className="size-3" aria-hidden />
          </Badge>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
            {props.name}
            <button aria-label="Toggle favorite" className="text-warning">
              <Star className="size-5 fill-current" aria-hidden />
            </button>
          </h1>
          <p className="text-sm text-muted">{props.subtitle}</p>
        </div>
        <Button variant="secondary" size="icon" aria-label="Record options">
          <MoreHorizontal />
        </Button>
      </div>

      {/* Key facts strip */}
      <Card className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Avatar name={props.owner} />
          <div className="leading-tight">
            <p className="text-xs text-muted">Owner</p>
            <p className="text-sm font-semibold">{props.owner}</p>
          </div>
        </div>
        <div className="px-4 py-3 leading-tight">
          <p className="text-xs text-muted">Deal Value</p>
          <p className="text-sm font-semibold">
            {props.dealValue != null ? formatCurrency(props.dealValue) : "—"}
          </p>
        </div>
        <div className="px-4 py-3 leading-tight">
          <p className="text-xs text-muted">Close Date</p>
          <p className="text-sm font-semibold">{props.closeDate ?? "—"}</p>
        </div>
      </Card>

      {/* Primary actions */}
      <div className="grid grid-cols-4 gap-2">
        <Button variant="secondary" className="h-auto flex-col gap-1.5 py-3">
          <Phone /> Call
        </Button>
        <Button variant="secondary" className="h-auto flex-col gap-1.5 py-3">
          <Mail /> Email
        </Button>
        <Button variant="secondary" className="h-auto flex-col gap-1.5 py-3">
          <StickyNote /> Add Note
        </Button>
        <Button variant="secondary" className="h-auto flex-col gap-1.5 py-3">
          <CheckSquare /> Create Task
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{props.about.title}</CardTitle>
              <Button variant="soft" size="sm">
                <Pencil /> Edit
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">{props.about.body}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="size-4 text-success" aria-hidden /> Recent Activity
              </CardTitle>
              <button className="text-sm font-medium text-brand hover:underline">View all</button>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {props.activity.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full border-2 border-border-strong" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted">{a.meta}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="size-4 text-brand" aria-hidden /> Tasks
              </CardTitle>
              <button className="text-sm font-medium text-brand hover:underline">View all</button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {props.tasks.map((t, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Complete ${t.title}`}
                      className="size-4 accent-[var(--brand)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted">{t.due}</p>
                    </div>
                    <Badge variant={priorityTone[t.priority]}>{t.priority}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-success" aria-hidden /> Estimates &amp; Invoices
              </CardTitle>
              <button className="text-sm font-medium text-brand hover:underline">View all</button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {props.financials.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {f.label} {f.number}
                        <Badge variant={f.statusTone}>{f.status}</Badge>
                      </p>
                      <p className="text-xs text-muted">{f.meta}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(f.amount)}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4 text-accent" aria-hidden /> Communications
              </CardTitle>
              <button className="text-sm font-medium text-brand hover:underline">View all</button>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {props.communications.map((c, i) => (
                  <li key={i}>
                    <button className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-hover">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                        <Mail className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{c.subject}</span>
                        <span className="block truncate text-xs text-muted">{c.meta}</span>
                      </span>
                      <ChevronDown className="size-4 -rotate-90 text-muted" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="p-8 text-center text-sm text-muted">
            Custom fields render here from the field definitions configured in Settings.
          </Card>
        </TabsContent>
        <TabsContent value="files">
          <Card className="p-8 text-center text-sm text-muted">
            No files yet. Attachments uploaded here are stored per-record with access control.
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card className="p-8 text-center text-sm text-muted">
            No notes yet. Use Add Note to log context for your team.
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card className="p-8 text-center text-sm text-muted">
            The full permission-aware timeline of emails, calls, stage changes, and
            financial events appears here.
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  DollarSign,
  BarChart3,
  ClipboardCheck,
  UserCheck,
  Plus,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  Handshake,
  MailOpen,
  CheckCircle2,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Minus,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/sparkline";
import {
  kpis,
  sparklines,
  stages,
  dealsByStage,
  stageTotal,
  recentActivity,
  tasks,
  integrations,
  currentUser,
} from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const kpiIcons = [Users, DollarSign, BarChart3, ClipboardCheck, UserCheck];
const kpiChip: Record<string, string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  accent: "bg-brand-soft text-accent",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-hover text-secondary",
};
const kpiStroke: Record<string, string> = {
  brand: "var(--brand)",
  success: "var(--success)",
  accent: "var(--accent)",
  warning: "var(--warning)",
  neutral: "var(--stage-4)",
};

const activityIcon = {
  lead: UserPlus,
  deal: Handshake,
  email: MailOpen,
  task: CheckCircle2,
  meeting: CalendarClock,
};

const priorityTone = { High: "danger", Medium: "warning", Low: "info" } as const;

export default function DashboardPage() {
  const firstName = currentUser.name.split(" ")[0];
  const funnelStages = stages;
  const totalPipeline = stages.reduce((s, st) => s + stageTotal(st.id), 0);
  const wonCount = dealsByStage("won").length;
  const totalCount = stages.reduce((s, st) => s + dealsByStage(st.id).length, 0);
  const winRate = Math.round((wonCount / Math.max(totalCount, 1)) * 100);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good morning, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md">
            <Plus /> Add widget
          </Button>
          <Button variant="secondary" size="md">
            <Calendar /> This week <ChevronDown className="!size-3.5 opacity-70" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Dashboard options">
            <MoreHorizontal />
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <span className={cn("flex size-9 items-center justify-center rounded-lg", kpiChip[kpi.tone])}>
                  <Icon className="size-4.5" aria-hidden />
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">{kpi.label}</p>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-medium",
                  kpi.direction === "up" && "text-success",
                  kpi.direction === "down" && "text-danger",
                  kpi.direction === "flat" && "text-muted"
                )}
              >
                {kpi.direction === "up" && <TrendingUp className="size-3.5" aria-hidden />}
                {kpi.direction === "down" && <TrendingDown className="size-3.5" aria-hidden />}
                {kpi.direction === "flat" && <Minus className="size-3.5" aria-hidden />}
                {kpi.delta}
              </p>
              <div className="mt-2">
                <Sparkline data={sparklines[kpi.label]} stroke={kpiStroke[kpi.tone]} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Pipeline overview */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <Button variant="secondary" size="sm">
              Sales Pipeline <ChevronDown className="!size-3.5 opacity-70" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {funnelStages.map((stage, i) => {
                const count = dealsByStage(stage.id).length;
                const widthPct = 100 - i * 14;
                return (
                  <div key={stage.id} className="flex justify-center">
                    <div
                      className="flex h-9 items-center justify-center rounded-md text-xs font-semibold text-white"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: `var(--${stage.color})`,
                      }}
                    >
                      {stage.name} ({count})
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Stage</span>
                <span className="flex gap-6">
                  <span>Deals</span>
                  <span className="w-16 text-right">Value</span>
                </span>
              </div>
              {funnelStages.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: `var(--${stage.color})` }}
                      aria-hidden
                    />
                    {stage.name}
                  </span>
                  <span className="flex gap-6 tabular-nums">
                    <span className="text-secondary">{dealsByStage(stage.id).length}</span>
                    <span className="w-16 text-right font-medium">
                      {formatCurrency(stageTotal(stage.id))}
                    </span>
                  </span>
                </div>
              ))}
              <p className="pt-1 text-xs text-muted">
                Win rate: {winRate}% · Total pipeline: {formatCurrency(totalPipeline)}
              </p>
            </div>

            <Link
              href="/pipeline"
              className="mt-4 block rounded-md border border-border py-2 text-center text-sm font-medium text-secondary hover:bg-hover"
            >
              View full pipeline
            </Link>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recentActivity.map((item) => {
                const Icon = activityIcon[item.type];
                return (
                  <li key={item.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-hover text-secondary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="truncate text-sm text-muted">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{item.time}</span>
                  </li>
                );
              })}
            </ol>
            <Link
              href="/communications"
              className="mt-4 block rounded-md border border-border py-2 text-center text-sm font-medium text-secondary hover:bg-hover"
            >
              View all activity
            </Link>
          </CardContent>
        </Card>

        {/* My tasks */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              All tasks <ChevronDown className="!size-3.5 opacity-70" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {tasks.filter((t) => t.status === "open").slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <input
                    type="checkbox"
                    aria-label={`Complete ${task.title}`}
                    className="size-4 shrink-0 cursor-pointer rounded-full border-border-strong accent-[var(--brand)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="truncate text-xs text-muted">{task.relatedTo}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{task.due}</span>
                  <Badge variant={priorityTone[task.priority]}>{task.priority}</Badge>
                </li>
              ))}
            </ul>
            <Link
              href="/tasks"
              className="mt-4 block rounded-md border border-border py-2 text-center text-sm font-medium text-secondary hover:bg-hover"
            >
              View all tasks
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Integrations health */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations Health</CardTitle>
          <Link href="/settings" className="text-sm font-medium text-brand hover:underline">
            View all integrations
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="rounded-lg border border-border p-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{integration.name}</p>
                  <Button variant="ghost" size="icon-sm" aria-label={`${integration.name} options`}>
                    <MoreHorizontal />
                  </Button>
                </div>
                <Badge
                  variant={integration.status === "Healthy" ? "success" : integration.status === "Warning" ? "warning" : "danger"}
                  className="mt-2"
                >
                  {integration.status}
                </Badge>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  {integration.status === "Healthy" ? (
                    <CircleCheck className="size-3.5 text-success" aria-hidden />
                  ) : (
                    <AlertTriangle className="size-3.5 text-warning" aria-hidden />
                  )}
                  {integration.lastSync}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import { ChevronDown, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { stages, dealsByStage, stageTotal } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

const leaderboard = [
  { name: "Olivia Bennett", activities: 148, deals: 9, revenue: 220000 },
  { name: "Marcus Reid", activities: 121, deals: 6, revenue: 158000 },
  { name: "Priya Sharma", activities: 96, deals: 5, revenue: 117500 },
  { name: "Dan Kowalski", activities: 74, deals: 3, revenue: 64000 },
];

export default function ReportsPage() {
  const totalValue = stages.reduce((s, st) => s + stageTotal(st.id), 0);
  const maxStage = Math.max(...stages.map((s) => stageTotal(s.id)));

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted">Fixed v1 dashboard · custom report builder ships in v2</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            This month <ChevronDown className="!size-3.5 opacity-70" />
          </Button>
          <Button variant="secondary">
            <Download /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Revenue this month", value: "$48,650", delta: "21% vs last month" },
          { label: "Win rate", value: "24%", delta: "4% vs last month" },
          { label: "Avg. deal size", value: "$4,083", delta: "6% vs last month" },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-sm text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{kpi.value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="size-3.5" aria-hidden /> {kpi.delta}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline value by stage</CardTitle>
            <span className="text-sm font-semibold">{formatCurrency(totalValue)}</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {stages.map((stage) => {
              const value = stageTotal(stage.id);
              return (
                <div key={stage.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: `var(--${stage.color})` }}
                        aria-hidden
                      />
                      {stage.name}
                      <span className="text-xs text-muted">
                        ({dealsByStage(stage.id).length} deals)
                      </span>
                    </span>
                    <span className="font-medium tabular-nums">{formatCurrency(value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-hover">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(value / maxStage) * 100}%`,
                        backgroundColor: `var(--${stage.color})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="py-2">Rep</th>
                  <th className="py-2 text-right">Activities</th>
                  <th className="py-2 text-right">Deals won</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((rep) => (
                  <tr key={rep.name} className="border-b border-border last:border-0">
                    <td className="py-2.5">
                      <span className="flex items-center gap-2 font-medium">
                        <Avatar name={rep.name} size="sm" /> {rep.name}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{rep.activities}</td>
                    <td className="py-2.5 text-right tabular-nums">{rep.deals}</td>
                    <td className="py-2.5 text-right font-medium tabular-nums">
                      {formatCurrency(rep.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

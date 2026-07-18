import type { Metadata } from "next";
import { Plus, Zap, Mail, Clock, UserPlus, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Automations" };

const rules = [
  {
    icon: Zap,
    name: "New lead → assign and notify",
    trigger: "When a lead is created",
    action: "Assign round-robin, notify owner, create follow-up task",
    enabled: true,
    runs: "38 runs this month",
  },
  {
    icon: Clock,
    name: "Stale deal nudge",
    trigger: "When a deal has no activity for 7 days",
    action: "Create task 'Check in' for deal owner",
    enabled: true,
    runs: "12 runs this month",
  },
  {
    icon: Mail,
    name: "Proposal follow-up draft",
    trigger: "When a deal enters Proposal",
    action: "AI drafts a follow-up email for review (requires approval to send)",
    enabled: false,
    runs: "Requires AI key + approval flow",
  },
  {
    icon: UserPlus,
    name: "Won deal → onboarding",
    trigger: "When a deal is marked Won",
    action: "Create onboarding task list and notify operations",
    enabled: true,
    runs: "3 runs this month",
  },
];

export default function AutomationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="mt-1 text-sm text-muted">
            Trigger + condition + action rules. External sends always require approval.
          </p>
        </div>
        <Button variant="primary">
          <Plus /> New rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-success" aria-hidden /> Human approval policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            Read-only and reversible internal actions (draft, suggested task, proposed note)
            can run automatically. External communications, financial actions, and
            destructive changes always show a preview and require approval before running.
            Every automated write lands in the audit log.
          </p>
        </CardContent>
      </Card>

      <Card>
        <ul className="divide-y divide-border">
          {rules.map((rule) => (
            <li key={rule.name} className="flex items-start gap-3 px-4 py-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                <rule.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {rule.name}
                  <Badge variant={rule.enabled ? "success" : "neutral"}>
                    {rule.enabled ? "Enabled" : "Off"}
                  </Badge>
                </p>
                <p className="mt-0.5 text-sm text-secondary">
                  <span className="text-muted">If</span> {rule.trigger}{" "}
                  <span className="text-muted">then</span> {rule.action}
                </p>
                <p className="mt-1 text-xs text-muted">{rule.runs}</p>
              </div>
              <Button variant="secondary" size="sm">Edit</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

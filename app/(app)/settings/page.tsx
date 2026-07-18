import type { Metadata } from "next";
import {
  Palette,
  Plug,
  Users,
  ShieldCheck,
  Database,
  KeyRound,
  Bot,
  ScrollText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Settings" };

const sections = [
  { icon: Palette, title: "Appearance & branding", body: "Logo, brand colors, light/dark themes, density, and per-instance labels (e.g. rename Deals to Wrap Jobs). Brand colors are validated for accessibility in both themes.", cta: "Customize theme" },
  { icon: Users, title: "Team & permissions", body: "Invite users, assign roles, and control visibility. Permissions are enforced in database policies, not just the UI.", cta: "Manage team" },
  { icon: ShieldCheck, title: "Security", body: "TOTP two-factor authentication, session management, and recovery. Passkeys are available behind a feature flag.", cta: "Security settings" },
  { icon: Database, title: "Data management", body: "CSV import and export, duplicate review queue, custom fields, trash and restore.", cta: "Manage data" },
  { icon: KeyRound, title: "API & webhooks", body: "Scoped API keys for lead capture and integrations, plus signed outbound webhooks.", cta: "Manage keys" },
  { icon: Bot, title: "AI assistant", body: "Bring your own API key (Anthropic, OpenAI, or another provider). Keys are stored encrypted server-side; per-user rate limits and approval flows apply.", cta: "Configure AI" },
  { icon: ScrollText, title: "Audit log", body: "Append-only record of role changes, integration changes, exports, deletions, and every AI-initiated action. Owner/admin only.", cta: "View audit log" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Instance configuration · administrative changes are captured in the audit log
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-4 text-brand" aria-hidden /> Integrations
          </CardTitle>
          <Badge variant="warning">Demo mode</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted">
            Connected email and QuickBooks are optional modules. Each requires the instance
            operator to register OAuth apps with the provider — see SETUP.md for the
            step-by-step registration guide.
          </p>
          <ul className="divide-y divide-border">
            {integrations.map((i) => (
              <li key={i.name} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{i.name}</span>
                  <span className="block text-xs text-muted">{i.lastSync}</span>
                </span>
                <Badge variant={i.status === "Healthy" ? "success" : "warning"}>{i.status}</Badge>
                <Button variant="secondary" size="sm">Manage</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} className="flex flex-col p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <s.icon className="size-4.5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold">{s.title}</p>
            <p className="mt-1 flex-1 text-sm text-muted">{s.body}</p>
            <Button variant="secondary" size="sm" className="mt-3 self-start">
              {s.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

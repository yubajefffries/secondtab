import type { Metadata } from "next";
import { Mail, Phone, MessageSquare, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Communications" };

const threads = [
  { icon: Mail, subject: "Proposal for Custom Home Project", from: "Olivia Bennett → Sarah Johnson", time: "May 20", unread: true, match: "Bright Homes" },
  { icon: Mail, subject: "Re: Fleet wrap timeline", from: "Sarah Johnson", time: "May 19", unread: true, match: "ACME Corporation" },
  { icon: Phone, subject: "Call logged · 14 min", from: "Michael Chen", time: "May 19", unread: false, match: "Brighton Labs" },
  { icon: Mail, subject: "Intro Call Summary", from: "Olivia Bennett", time: "May 18", unread: true, match: "Bright Homes" },
  { icon: MessageSquare, subject: "Text · install photos request", from: "Stephanie Rogers", time: "May 17", unread: false, match: "Marble Group" },
];

export default function CommunicationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
          <p className="mt-1 text-sm text-muted">
            Logged conversations across email, calls, and texts
          </p>
        </div>
        <Button variant="primary">Connect inbox</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No inbox connected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            Connect Gmail or Microsoft 365 in Settings to log conversations automatically.
            Emails are matched to contacts with a confidence score you can review and
            correct — nothing is filed silently. The sample threads below show how logged
            communication appears.
          </p>
        </CardContent>
      </Card>

      <Card>
        <ul className="divide-y divide-border">
          {threads.map((t, i) => (
            <li key={i}>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-hover">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <t.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{t.subject}</span>
                    {t.unread && <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />}
                  </span>
                  <span className="block truncate text-xs text-muted">{t.from}</span>
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  <Link2 className="size-3" aria-hidden /> {t.match}
                </Badge>
                <span className="shrink-0 text-xs text-muted">{t.time}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Calendar" };

const events: Record<number, { label: string; tone: string }[]> = {
  5: [{ label: "Intro call · ACME", tone: "bg-brand-soft text-brand" }],
  8: [{ label: "Wrap install · Marble", tone: "bg-success-soft text-success" }],
  12: [
    { label: "Discovery · Bright Homes", tone: "bg-brand-soft text-brand" },
    { label: "Proposal due", tone: "bg-warning-soft text-warning" },
  ],
  15: [{ label: "Demo · Summit Systems", tone: "bg-brand-soft text-accent" }],
  19: [{ label: "Contract review · Nexus", tone: "bg-warning-soft text-warning" }],
  22: [{ label: "Kickoff · Coastal Media", tone: "bg-success-soft text-success" }],
  26: [{ label: "Exec review · Titan", tone: "bg-brand-soft text-brand" }],
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  // Fixed demo month: May 2025 (Thu start, 31 days)
  const startOffset = 4;
  const daysInMonth = 31;
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Previous month">
              <ChevronLeft />
            </Button>
            <span className="min-w-28 text-center text-sm font-semibold">May 2025</span>
            <Button variant="ghost" size="icon-sm" aria-label="Next month">
              <ChevronRight />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">Today</Button>
          <Button variant="primary">
            <Plus /> New event
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-175">
          <div className="grid grid-cols-7 border-b border-border">
            {days.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "min-h-24 border-b border-r border-border p-1.5 [&:nth-child(7n)]:border-r-0",
                  i >= 28 && "border-b-0",
                  day === null && "bg-canvas"
                )}
              >
                {day && (
                  <>
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                        day === 22 ? "bg-brand text-brand-foreground" : "text-secondary"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {(events[day] ?? []).map((e) => (
                        <p
                          key={e.label}
                          className={cn("truncate rounded px-1.5 py-0.5 text-[11px] font-medium", e.tone)}
                        >
                          {e.label}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <p className="text-xs text-muted">
        Google Calendar and Microsoft 365 sync connects in Settings → Integrations once the
        instance operator has registered OAuth apps (see SETUP.md).
      </p>
    </div>
  );
}

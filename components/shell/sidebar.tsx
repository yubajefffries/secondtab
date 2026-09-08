"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Filter,
  CheckSquare,
  Calendar,
  MessageSquare,
  BarChart3,
  Zap,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { InstanceConfig } from "@/lib/instance-config";
import type { SessionProfile } from "@/lib/session-profile";
import { isDemoMode } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/contacts", key: "person", icon: Users },
  { href: "/companies", key: "company", icon: Building2 },
  { href: "/pipeline", key: "deal", icon: Filter },
  { href: "/tasks", key: "task", icon: CheckSquare },
  { href: "/calendar", key: "calendar", icon: Calendar },
  { href: "/communications", key: "email", icon: MessageSquare },
  { href: "/reports", key: "report", icon: BarChart3 },
  { href: "/automations", key: "workflow", icon: Zap },
  { href: "/settings", key: "settings", icon: Settings },
];

const swatches = ["#2563eb", "#16a34a", "#7c3aed", "#ea580c"];

export function Sidebar({ open, config, profile }: {
  open: boolean;
  config: InstanceConfig;
  profile: SessionProfile;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-sidebar md:flex",
        !open && "md:hidden"
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <Sparkles className="size-6 text-brand" aria-hidden />
        <span className="text-lg font-bold tracking-tight">{config.business_name}</span>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-2 thin-scroll">
        <ul className="space-y-0.5">
          {nav.filter((item) => config.enabled_modules[item.key] !== false).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-secondary hover:bg-hover hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4.5 shrink-0" aria-hidden />
                  <span className="flex-1">{config.object_labels[item.key]}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-semibold">Customize your experience</p>
          <p className="mt-1 text-xs text-muted">
            Update your theme and brand colors in Settings.
          </p>
          <div className="mt-3 flex items-center gap-2">
            {swatches.map((c) => (
              <Link
                key={c}
                href="/settings"
                aria-label={`Brand color ${c}`}
                className="size-5 rounded-full border border-border-strong"
                style={{ backgroundColor: c }}
              />
            ))}
            <Link
              href="/settings"
              aria-label="More colors"
              className="flex size-5 items-center justify-center rounded-full border border-dashed border-border-strong text-xs text-muted"
            >
              +
            </Link>
          </div>
        </div>

        {isDemoMode && <div className="mt-3 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-semibold">Self-hosted</p>
          <p className="mt-1 text-xs text-muted">Demo mode · no instance connected</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hover">
            <div className="h-full w-1/2 rounded-full bg-brand" />
          </div>
          <Link href="/settings" className="mt-2 inline-block text-xs font-medium text-brand hover:underline">
            Connect Supabase
          </Link>
        </div>}
      </nav>

      <button className="flex items-center gap-3 border-t border-border px-5 py-3 text-left hover:bg-hover">
        <Avatar name={profile.name} size="lg" />
        <span className="flex-1 leading-tight">
          <span className="block text-sm font-semibold">{profile.name}</span>
          <span className="block text-xs text-muted">{config.business_name}</span>
        </span>
        <ChevronDown className="size-4 text-muted" aria-hidden />
      </button>
    </aside>
  );
}

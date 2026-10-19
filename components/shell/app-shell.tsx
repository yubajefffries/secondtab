"use client";

import * as React from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileTabbar } from "@/components/shell/mobile-tabbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { NewContactDialog } from "@/components/new-contact-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoStoreProvider } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Screens that read live Supabase data on a provisioned instance. Everything
// else still renders sample data, so live users get an honest banner there.
const LIVE_ROUTES = ["/leads", "/contacts"];

import type { InstanceConfig } from "@/lib/instance-config";
import type { SessionProfile } from "@/lib/session-profile";

export function AppShell({ children, config, profile }: {
  children: React.ReactNode;
  config: InstanceConfig;
  profile: SessionProfile;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();
  const showSampleBanner =
    !isDemoMode &&
    !LIVE_ROUTES.some((r) => pathname === r);

  return (
    <DemoStoreProvider>
      <TooltipProvider delayDuration={300}>
        <Sidebar open={sidebarOpen} config={config} profile={profile} />
        <div
          className={cn(
            "flex min-h-dvh flex-col pb-16 md:pb-0",
            sidebarOpen && "md:pl-60"
          )}
        >
          <Topbar
            profile={profile}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onOpenSearch={() => setSearchOpen(true)}
          />
          {showSampleBanner && (
            <div role="note" className="border-b border-border bg-warning-soft px-4 py-2 text-sm text-warning md:px-6">
              Sample data: this screen isn&apos;t connected to your records yet. Your real website inquiries are in{" "}
              <Link href="/leads" className="font-medium underline">Leads</Link>.
            </div>
          )}
          <main className="flex-1">{children}</main>
        </div>
        <MobileTabbar />
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
        <NewContactDialog />
      </TooltipProvider>
    </DemoStoreProvider>
  );
}

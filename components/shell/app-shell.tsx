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

import type { InstanceConfig } from "@/lib/instance-config";
import type { SessionProfile } from "@/lib/session-profile";

export function AppShell({ children, config, profile }: {
  children: React.ReactNode;
  config: InstanceConfig;
  profile: SessionProfile;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchOpen, setSearchOpen] = React.useState(false);

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
          <main className="flex-1">{children}</main>
        </div>
        <MobileTabbar />
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
        <NewContactDialog />
      </TooltipProvider>
    </DemoStoreProvider>
  );
}

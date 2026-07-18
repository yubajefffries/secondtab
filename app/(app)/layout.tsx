"use client";

import * as React from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileTabbar } from "@/components/shell/mobile-tabbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar open={sidebarOpen} />
      <div
        className={cn(
          "flex min-h-dvh flex-col pb-16 md:pb-0",
          sidebarOpen && "md:pl-60"
        )}
      >
        <Topbar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="flex-1">{children}</main>
      </div>
      <MobileTabbar />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  );
}

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Menu,
  Search,
  Plus,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  UserPlus,
  Building2,
  Handshake,
  CheckSquare,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function Topbar({
  onToggleSidebar,
  onOpenSearch,
}: {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle sidebar"
        className="hidden md:inline-flex"
        onClick={onToggleSidebar}
      >
        <Menu />
      </Button>

      <button
        onClick={onOpenSearch}
        className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-canvas px-3 text-sm text-muted transition-colors hover:border-border-strong md:max-w-xl"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 truncate text-left">
          Search contacts, companies, deals, tasks...
        </span>
        <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted sm:block">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="primary" className="gap-1.5">
              <Plus />
              <span className="hidden sm:inline">Quick create</span>
              <ChevronDown className="!size-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Create new</DropdownMenuLabel>
            <DropdownMenuItem><UserPlus /> Contact</DropdownMenuItem>
            <DropdownMenuItem><Building2 /> Company</DropdownMenuItem>
            <DropdownMenuItem><Handshake /> Deal</DropdownMenuItem>
            <DropdownMenuItem><CheckSquare /> Task</DropdownMenuItem>
            <DropdownMenuItem><StickyNote /> Note</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand" aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Help" className="hidden sm:inline-flex">
          <HelpCircle />
        </Button>

        <div className="hidden items-center rounded-md border border-border p-0.5 sm:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Light mode"
            aria-pressed={mounted ? resolvedTheme === "light" : undefined}
            className={cn(mounted && resolvedTheme === "light" && "bg-hover text-foreground")}
            onClick={() => setTheme("light")}
          >
            <Sun />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Dark mode"
            aria-pressed={mounted ? resolvedTheme === "dark" : undefined}
            className={cn(mounted && resolvedTheme === "dark" && "bg-hover text-foreground")}
            onClick={() => setTheme("dark")}
          >
            <Moon />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex items-center gap-1 rounded-md p-1 hover:bg-hover"
            >
              <Avatar name={currentUser.name} />
              <ChevronDown className="size-3.5 text-muted" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {currentUser.name}
              <span className="block font-normal text-muted">{currentUser.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

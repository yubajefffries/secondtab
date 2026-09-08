"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionProfile } from "@/lib/session-profile";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { useDemoStore } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export function Topbar({
  profile,
  onToggleSidebar,
  onOpenSearch,
}: {
  profile: SessionProfile;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const { setNewContactOpen } = useDemoStore();
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  async function signOut() {
    setSignOutError(null);
    try {
      if (!isDemoMode) {
        const { error } = await createClient().auth.signOut();
        if (error) throw error;
      }
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setSignOutError("Unable to sign out. Please try again.");
    }
  }
  // true after hydration only; avoids a server/client mismatch on the theme toggle
  const mounted = React.useSyncExternalStore(
    React.useCallback(() => () => {}, []),
    () => true,
    () => false
  );

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
            <DropdownMenuItem onSelect={() => setNewContactOpen(true)}>
              <UserPlus /> Contact
            </DropdownMenuItem>
            <DropdownMenuItem disabled><Building2 /> Company</DropdownMenuItem>
            <DropdownMenuItem disabled><Handshake /> Deal</DropdownMenuItem>
            <DropdownMenuItem disabled><CheckSquare /> Task</DropdownMenuItem>
            <DropdownMenuItem disabled><StickyNote /> Note</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-normal text-muted">
              More record types unlock with live data
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <div className="px-2 py-6 text-center text-sm text-muted">
              You&apos;re all caught up. Task reminders, mentions, and payment
              updates will land here.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <a
          href="https://github.com/yubajefffries/secondtab#readme"
          target="_blank"
          rel="noreferrer"
          aria-label="Help"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden sm:inline-flex")}
        >
          <HelpCircle />
        </a>

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

        {signOutError && <p role="alert" className="text-xs text-danger">{signOutError}</p>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex items-center gap-1 rounded-md p-1 hover:bg-hover"
            >
              <Avatar name={profile.name} />
              <ChevronDown className="size-3.5 text-muted" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {profile.name}
              <span className="block font-normal text-muted">{profile.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

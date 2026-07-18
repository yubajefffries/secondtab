"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Handshake, Users, CheckSquare, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/pipeline", label: "Deals", icon: Handshake },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, badge: 3 },
  { href: "/settings", label: "More", icon: LayoutGrid },
];

export function MobileTabbar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-brand" : "text-muted"
            )}
          >
            <span className="relative">
              <tab.icon className="size-5" aria-hidden />
              {tab.badge ? (
                <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              ) : null}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Search,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  LayoutDashboard,
  Filter,
  BarChart3,
  Settings,
} from "lucide-react";
import { deals, people, companies, tasks } from "@/lib/demo-data";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <DialogPrimitive.Content
          aria-label="Global search"
          className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-elevated shadow-pop"
        >
          <DialogPrimitive.Title className="sr-only">Global search</DialogPrimitive.Title>
          <Command label="Global search">
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="size-4 text-muted" aria-hidden />
              <Command.Input
                autoFocus
                placeholder="Search contacts, companies, deals, tasks..."
                className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2 thin-scroll">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
                  { icon: Filter, label: "Pipeline", href: "/pipeline" },
                  { icon: Users, label: "Contacts", href: "/contacts" },
                  { icon: Building2, label: "Companies", href: "/companies" },
                  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
                  { icon: BarChart3, label: "Reports", href: "/reports" },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map((i) => (
                  <Command.Item
                    key={i.href}
                    onSelect={() => go(i.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-hover"
                  >
                    <i.icon className="size-4 text-muted" aria-hidden />
                    {i.label}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="People" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                {people.slice(0, 5).map((p) => (
                  <Command.Item
                    key={p.id}
                    value={`${p.name} ${p.company}`}
                    onSelect={() => go(`/contacts/${p.id}`)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-hover"
                  >
                    <Users className="size-4 text-muted" aria-hidden />
                    <span>{p.name}</span>
                    <span className="text-xs text-muted">{p.company}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Companies" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                {companies.slice(0, 4).map((c) => (
                  <Command.Item
                    key={c.id}
                    value={c.name}
                    onSelect={() => go(`/companies/${c.id}`)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-hover"
                  >
                    <Building2 className="size-4 text-muted" aria-hidden />
                    {c.name}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Deals" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                {deals.slice(0, 4).map((d) => (
                  <Command.Item
                    key={d.id}
                    value={`${d.company} ${d.name}`}
                    onSelect={() => go("/pipeline")}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-hover"
                  >
                    <Handshake className="size-4 text-muted" aria-hidden />
                    <span>{d.company}</span>
                    <span className="text-xs text-muted">
                      ${d.value.toLocaleString()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Tasks" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                {tasks.slice(0, 3).map((t) => (
                  <Command.Item
                    key={t.id}
                    value={t.title}
                    onSelect={() => go("/tasks")}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-hover"
                  >
                    <CheckSquare className="size-4 text-muted" aria-hidden />
                    {t.title}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

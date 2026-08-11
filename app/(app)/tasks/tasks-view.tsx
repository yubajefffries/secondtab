"use client";

import * as React from "react";
import { Plus, ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { tasks as seedTasks } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const priorityTone = { High: "danger", Medium: "warning", Low: "info" } as const;

export function TasksView() {
  const [tasks, setTasks] = React.useState(seedTasks);
  const [filter, setFilter] = React.useState("");

  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "completed");

  const query = filter.trim().toLowerCase();
  const visible = query
    ? [...open, ...done].filter((t) =>
        [t.title, t.relatedTo, t.priority].join(" ").toLowerCase().includes(query)
      )
    : [...open, ...done];

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? ("open" as const) : ("completed" as const) }
          : t
      )
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-muted">
            {open.length} open · {done.length} completed
          </p>
        </div>
        <Button variant="primary" disabled title="Task creation ships with live data wiring">
          <Plus /> New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted" aria-hidden />
          <Input
            placeholder="Filter tasks..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter tasks"
          />
        </div>
        <Button variant="secondary" size="sm" disabled title="Assignee filter ships with live data wiring">
          Assignee: Me <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm" disabled title="Due-date filter ships with live data wiring">
          Due: Any time <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
        <Button variant="secondary" size="sm" disabled title="Priority filter ships with live data wiring">
          Priority: All <ChevronDown className="!size-3.5 opacity-70" />
        </Button>
      </div>

      <Card>
        <ul className="divide-y divide-border">
          {visible.map((task) => (
            <li key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-hover">
              <input
                type="checkbox"
                checked={task.status === "completed"}
                onChange={() => toggleTask(task.id)}
                aria-label={`Complete ${task.title}`}
                className="size-4 shrink-0 accent-[var(--brand)]"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    task.status === "completed" && "text-muted line-through"
                  )}
                >
                  {task.title}
                </p>
                <p className="text-xs text-muted">{task.relatedTo}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs",
                  task.due === "Today" && task.status === "open"
                    ? "font-semibold text-danger"
                    : "text-muted"
                )}
              >
                {task.due}
              </span>
              <Badge variant={priorityTone[task.priority]}>{task.priority}</Badge>
              <Avatar name={task.assignee} size="sm" />
            </li>
          ))}
          {visible.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-muted">
              No tasks match &ldquo;{filter}&rdquo;.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

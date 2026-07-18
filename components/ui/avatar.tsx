"use client";

import * as React from "react";
import { cn, initials } from "@/lib/utils";

const palette = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
];

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = palette[hash % palette.length];
  const sizes = {
    xs: "size-5 text-[9px]",
    sm: "size-6 text-[10px]",
    md: "size-8 text-xs",
    lg: "size-10 text-sm",
  };
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        color,
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

import "server-only";
import { isDemoMode } from "@/lib/supabase/server";

// Public presentation fields from the single instance_settings row.
// Keep this contract aligned with 00000000000001_core_schema.sql.
export interface InstanceConfig {
  business_name: string;
  logo_url: string | null;
  brand_primary: string;
  object_labels: Record<string, string>;
  enabled_modules: Record<string, boolean>;
}

const defaults: InstanceConfig = {
  business_name: "Your business",
  logo_url: null,
  brand_primary: "#2563eb",
  object_labels: {
    dashboard: "Dashboard",
    person: "Contacts",
    company: "Companies",
    deal: "Pipeline",
    task: "Tasks",
    calendar: "Calendar",
    email: "Communications",
    report: "Reports",
    workflow: "Automations",
    settings: "Settings",
  },
  enabled_modules: { email: false, quickbooks: false, calendar: false, ai: false },
};

const demoDefaults: InstanceConfig = {
  ...defaults,
  business_name: "SecondTab",
  enabled_modules: { email: true, quickbooks: true, calendar: true, ai: true },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Server environment config makes branding available before authentication,
// without exposing instance_settings through RLS or using a service-role key.
export function getInstanceConfig(): InstanceConfig {
  if (isDemoMode) return demoDefaults;
  const config: unknown = JSON.parse(process.env.INSTANCE_CONFIG || "{}");
  if (
    !isRecord(config) ||
    (config.business_name !== undefined &&
      (typeof config.business_name !== "string" || !config.business_name.trim())) ||
    (config.logo_url !== undefined && config.logo_url !== null && typeof config.logo_url !== "string") ||
    (config.brand_primary !== undefined && typeof config.brand_primary !== "string") ||
    (config.object_labels !== undefined &&
      (!isRecord(config.object_labels) || Object.values(config.object_labels).some((v) => typeof v !== "string"))) ||
    (config.enabled_modules !== undefined &&
      (!isRecord(config.enabled_modules) || Object.values(config.enabled_modules).some((v) => typeof v !== "boolean")))
  ) {
    throw new Error("INSTANCE_CONFIG must match the instance branding contract.");
  }
  // Pick only the public contract fields before passing config to the shell.
  return {
    business_name: (config.business_name as string | undefined) ?? defaults.business_name,
    logo_url: (config.logo_url as string | null | undefined) ?? defaults.logo_url,
    brand_primary: (config.brand_primary as string | undefined) ?? defaults.brand_primary,
    object_labels: { ...defaults.object_labels, ...config.object_labels as Record<string, string> },
    enabled_modules: { ...defaults.enabled_modules, ...config.enabled_modules as Record<string, boolean> },
  };
}

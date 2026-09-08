import "server-only";
import { cache } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/server";

// Public presentation fields from the single instance_settings row.
// Keep this contract aligned with 00000000000001_core_schema.sql.
export interface InstanceConfig {
  business_name: string;
  logo_url: string | null;
  brand_primary: string;
  brand_accent: string;
  object_labels: Record<string, string>;
  enabled_modules: Record<string, boolean>;
}

const defaults: InstanceConfig = {
  business_name: "Your business",
  logo_url: null,
  brand_primary: "#2563eb",
  brand_accent: "#7c3aed",
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

function parseConfig(config: unknown): InstanceConfig | null {
  if (
    !isRecord(config) ||
    (config.business_name !== undefined &&
      (typeof config.business_name !== "string" || !config.business_name.trim())) ||
    (config.logo_url !== undefined && config.logo_url !== null && typeof config.logo_url !== "string") ||
    (config.brand_primary !== undefined && typeof config.brand_primary !== "string") ||
    (config.brand_accent !== undefined && typeof config.brand_accent !== "string") ||
    (config.object_labels !== undefined &&
      (!isRecord(config.object_labels) || Object.values(config.object_labels).some((v) => typeof v !== "string"))) ||
    (config.enabled_modules !== undefined &&
      (!isRecord(config.enabled_modules) || Object.values(config.enabled_modules).some((v) => typeof v !== "boolean")))
  ) {
    return null;
  }
  // Pick only the public contract fields before passing config to the shell.
  return {
    business_name: (config.business_name as string | undefined) ?? defaults.business_name,
    logo_url: (config.logo_url as string | null | undefined) ?? defaults.logo_url,
    brand_primary: (config.brand_primary as string | undefined) ?? defaults.brand_primary,
    brand_accent: (config.brand_accent as string | undefined) ?? defaults.brand_accent,
    object_labels: { ...defaults.object_labels, ...config.object_labels as Record<string, string> },
    enabled_modules: { ...defaults.enabled_modules, ...config.enabled_modules as Record<string, boolean> },
  };
}

// Request-scoped memoization keeps metadata and the page on the same branding
// without caching settings across requests. Only the public RPC reaches clients.
export const getInstanceConfig = cache(async (): Promise<InstanceConfig> => {
  if (isDemoMode) return demoDefaults;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("public_instance_branding").maybeSingle();
    if (!error && data) {
      const config = parseConfig(data);
      if (config) return config;
    }
  } catch {
    // Branding remains available during connection failures or initial setup.
  }

  try {
    return parseConfig(JSON.parse(process.env.INSTANCE_CONFIG || "{}")) ?? defaults;
  } catch {
    return defaults;
  }
});

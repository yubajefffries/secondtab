import { AppShell } from "@/components/shell/app-shell";
import { getInstanceConfig } from "@/lib/instance-config";
import { getSessionProfile } from "@/lib/session-profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const config = getInstanceConfig();
  const profile = await getSessionProfile();
  return <AppShell config={config} profile={profile}>{children}</AppShell>;
}

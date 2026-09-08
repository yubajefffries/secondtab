"use client";

import { useState } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (isDemoMode) {
      router.replace("/dashboard");
      return;
    }
    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setPending(true);
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Unable to sign in. Check your email and password and try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form className="mt-5 space-y-3" onSubmit={signIn}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <Input id="password" type="password" autoComplete="current-password" required />
        </div>
        <p role="alert" className="text-sm text-danger">{error}</p>
        <Button type="submit" variant="primary" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" aria-hidden /> or
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <Button variant="secondary" className="w-full" disabled>
        Email me a magic link
      </Button>
      <Button variant="secondary" className="mt-2 w-full" disabled>
        <KeyRound /> Sign in with a passkey
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Passkeys are experimental and currently disabled.
      </p>
    </>
  );
}

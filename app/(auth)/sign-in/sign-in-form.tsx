"use client";

import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Demo-mode sign-in. Credentials are never serialized or submitted anywhere:
// the handled submit prevents the default form navigation and the inputs have
// no `name`, so nothing can land in a URL, log, or request body. Real
// Supabase auth (signInWithPassword + TOTP) replaces this in the live wiring
// phase.
export function SignInForm() {
  const router = useRouter();

  function enterDemo(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    router.push("/dashboard");
  }

  return (
    <>
      <form className="mt-5 space-y-3" onSubmit={enterDemo}>
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
        <Button type="submit" variant="primary" className="w-full">
          Sign in
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" aria-hidden /> or
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <Button variant="secondary" className="w-full" onClick={() => enterDemo()}>
        Email me a magic link
      </Button>
      <Button variant="secondary" className="mt-2 w-full" onClick={() => enterDemo()}>
        <KeyRound /> Sign in with a passkey
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Passkeys are an optional preview feature on this instance.
      </p>
    </>
  );
}

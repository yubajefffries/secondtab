import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Sparkles className="size-7 text-brand" aria-hidden />
          <span className="text-xl font-bold tracking-tight">Northstar CRM</span>
        </div>

        <Card className="p-6">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Use your work email. Two-factor authentication is required for admins.
          </p>

          <form className="mt-5 space-y-3" action="/dashboard">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" name="email" placeholder="you@company.com" required />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link href="/sign-in" className="text-xs font-medium text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" name="password" required />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" aria-hidden /> or
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          <Button variant="secondary" className="w-full">
            Email me a magic link
          </Button>
          <Button variant="secondary" className="mt-2 w-full">
            <KeyRound /> Sign in with a passkey
          </Button>
          <p className="mt-2 text-center text-xs text-muted">
            Passkeys are an optional preview feature on this instance.
          </p>
        </Card>

        <p className="mt-4 text-center text-xs text-muted">
          Demo mode: any submission opens the app with sample data.
        </p>
      </div>
    </div>
  );
}

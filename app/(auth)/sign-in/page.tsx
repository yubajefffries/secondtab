import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Sparkles className="size-7 text-brand" aria-hidden />
          <span className="text-xl font-bold tracking-tight">SecondTab</span>
        </div>
        <p className="mb-6 -mt-4 text-center text-sm text-muted">
          Your relationships, one tab away.
        </p>

        <Card className="p-6">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Use your work email to sign in to your team&apos;s instance.
          </p>

          <SignInForm />
        </Card>

        <p className="mt-4 text-center text-xs text-muted">
          Demo mode: any submission opens the app with sample data.
        </p>
      </div>
    </div>
  );
}

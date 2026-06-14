"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { portalAuthApi } from "@/lib/api/portal";
import { cn } from "@/lib/utils";

import type { ApiError } from "@/types/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (e: string) => portalAuthApi.forgotPassword(e),
    onSuccess: () => setSubmitted(true),
    onError: () => {
      // Show the same success message to avoid revealing whether the email exists
      setSubmitted(true);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});
    mutation.mutate(result.data.email);
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground">
            If that email is registered, you&apos;ll receive a link shortly.
          </div>
          <Link
            href="/login"
            className="block text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={cn(fieldErrors.email && "border-destructive")}
            />
            {fieldErrors.email && (
              <p
                id="email-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sending…" : "Send Reset Link"}
          </Button>

          <Link
            href="/login"
            className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}

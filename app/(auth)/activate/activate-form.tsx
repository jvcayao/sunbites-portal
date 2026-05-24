"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { portalAuthApi } from "@/lib/api/portal";
import { cn } from "@/lib/utils";

import type { ApiError } from "@/types/auth";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export function ActivateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [values, setValues] = useState<Partial<FormData>>({
    password: "",
    password_confirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      portalAuthApi.resetPassword({
        token: token!,
        email: email!,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    onSuccess: () => setSuccess(true),
    onError: (error: ApiError) => {
      if (error.errors?.token) {
        setTokenError("This activation link is invalid or has expired.");
      } else {
        setTokenError(error.message ?? "Something went wrong. Please try again.");
      }
    },
  });

  if (!token || !email) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Invalid activation link.
        </div>
        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">All set!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your password has been set. You can now sign in.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground">
          Your account is now activated. Welcome to Sunbites!
        </div>
        <Link
          href="/login"
          className="block text-center text-sm text-primary underline-offset-4 hover:underline"
        >
          Sign in to your account
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});
    setTokenError(null);
    mutation.mutate(result.data);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Set your password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a password to activate your account.
        </p>
      </div>

      {tokenError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {tokenError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={values.password ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className={cn(fieldErrors.password && "border-destructive")}
          />
          {fieldErrors.password && (
            <p id="password-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password_confirmation">Confirm password</Label>
          <Input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.password_confirmation ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, password_confirmation: e.target.value }))
            }
            aria-invalid={!!fieldErrors.password_confirmation}
            aria-describedby={
              fieldErrors.password_confirmation ? "confirm-error" : undefined
            }
            className={cn(fieldErrors.password_confirmation && "border-destructive")}
          />
          {fieldErrors.password_confirmation && (
            <p id="confirm-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.password_confirmation[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Setting password…" : "Set Password"}
        </Button>

        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}

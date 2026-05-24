"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

import type { ApiError } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const store = useAuthStore();

  const [values, setValues] = useState<Partial<LoginFormData>>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [notActivated, setNotActivated] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, parent }) => {
      store.login(token, parent);
      router.push("/dashboard");
    },
    onError: (error: ApiError) => {
      if (error.error === "account_not_activated") {
        setNotActivated(true);
        return;
      }
      setNotActivated(false);
      toast.error(error.message ?? "Login failed. Please try again.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotActivated(false);

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setFieldErrors({});
    mutation.mutate(result.data);
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Parent Portal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      {notActivated && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400" role="alert">
          Your account has not been activated yet. Check your email for an activation link.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={cn(fieldErrors.email && "border-destructive")}
          />
          {fieldErrors.email && (
            <p id="email-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, password: e.target.value }))
            }
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

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

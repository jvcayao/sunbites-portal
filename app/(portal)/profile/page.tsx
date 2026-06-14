"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { profileApi } from "@/lib/api/portal";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

import type { ApiError } from "@/types/auth";
import type { AuthParent } from "@/types/auth";

// ---- Validation ----

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ---- Profile Info Section ----

function ProfileInfoSection({ profile }: { profile: AuthParent }) {
  const queryClient = useQueryClient();
  const store = useAuthStore();

  const [values, setValues] = useState<ProfileFormData>({
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone ?? "",
    address: profile.address ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: (updated) => {
      toast.success("Profile updated.");
      store.login(store.token!, updated);
      queryClient.setQueryData(["profile"], updated);
    },
    onError: (err: ApiError) => {
      if (err.errors) {
        const mapped: Record<string, string[]> = {};
        Object.entries(err.errors).forEach(([k, v]) => (mapped[k] = v));
        setFieldErrors(mapped);
      } else {
        toast.error(err.message ?? "Failed to update profile.");
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = profileSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});
    mutation.mutate({
      first_name: result.data.first_name,
      last_name: result.data.last_name,
      phone: result.data.phone ?? "",
      address: result.data.address ?? "",
    });
  }

  function field(
    id: keyof ProfileFormData,
    label: string,
    type = "text",
    autocomplete?: string,
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type={type}
          autoComplete={autocomplete}
          value={values[id] ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
          aria-invalid={!!fieldErrors[id]}
          aria-describedby={fieldErrors[id] ? `${id}-error` : undefined}
          className={cn(fieldErrors[id] && "border-destructive")}
        />
        {fieldErrors[id] && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs text-destructive"
          >
            {fieldErrors[id][0]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="profile-info-heading">
      <h2 id="profile-info-heading" className="mb-4 text-lg font-semibold">
        Personal Information
      </h2>
      <div className="rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("first_name", "First name", "text", "given-name")}
            {field("last_name", "Last name", "text", "family-name")}
          </div>
          {field("phone", "Phone number", "tel", "tel")}
          {field("address", "Address")}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ---- Change Password Section ----

function ChangePasswordSection() {
  const [values, setValues] = useState<Partial<PasswordFormData>>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setValues({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setFieldErrors({});
    },
    onError: (err: ApiError) => {
      if (err.errors) {
        const mapped: Record<string, string[]> = {};
        Object.entries(err.errors).forEach(([k, v]) => (mapped[k] = v));
        setFieldErrors(mapped);
      } else {
        toast.error(err.message ?? "Failed to change password.");
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = passwordSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});
    mutation.mutate(result.data);
  }

  function field(id: keyof PasswordFormData, label: string) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`pwd-${id}`}>{label}</Label>
        <Input
          id={`pwd-${id}`}
          type="password"
          autoComplete={
            id === "current_password" ? "current-password" : "new-password"
          }
          value={values[id] ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
          aria-invalid={!!fieldErrors[id]}
          aria-describedby={fieldErrors[id] ? `pwd-${id}-error` : undefined}
          className={cn(fieldErrors[id] && "border-destructive")}
        />
        {fieldErrors[id] && (
          <p
            id={`pwd-${id}-error`}
            role="alert"
            className="text-xs text-destructive"
          >
            {fieldErrors[id][0]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="change-password-heading">
      <h2 id="change-password-heading" className="mb-4 text-lg font-semibold">
        Change Password
      </h2>
      <div className="rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {field("current_password", "Current password")}
          {field("password", "New password")}
          {field("password_confirmation", "Confirm new password")}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Changing…" : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ---- Profile Photo Section ----

function ProfilePhotoSection({ profile }: { profile: AuthParent }) {
  const queryClient = useQueryClient();
  const store = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: profileApi.uploadPhoto,
    onSuccess: (result) => {
      toast.success("Photo updated.");
      const updatedProfile = {
        ...profile,
        profile_photo_url: result.profile_photo_url,
      };
      store.login(store.token!, updatedProfile);
      queryClient.setQueryData(["profile"], updatedProfile);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to upload photo.");
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    mutation.mutate(file);
    e.target.value = "";
  }

  const initials =
    `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();

  return (
    <section aria-labelledby="photo-heading">
      <h2 id="photo-heading" className="mb-4 text-lg font-semibold">
        Profile Photo
      </h2>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative h-20 w-20 shrink-0">
            {profile.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                fill
                className="rounded-full object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {initials}
              </div>
            )}
            {mutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <span className="text-xs text-white">Uploading…</span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              JPG, PNG, or WebP. Max 2 MB.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={mutation.isPending}
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              {mutation.isPending ? "Uploading…" : "Change Photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Upload profile photo"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Main Page ----

function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.get,
  });

  if (isLoading) return <ProfilePageSkeleton />;

  if (error || !profile) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-destructive">
          Failed to load profile. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
      </div>

      <ProfilePhotoSection profile={profile} />
      <ProfileInfoSection profile={profile} />
      <ChangePasswordSection />
    </div>
  );
}

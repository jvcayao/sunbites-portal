"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PortalLayout } from "@/components/layouts/portal-layout";
import { useAuthStore } from "@/lib/store/auth";

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) router.replace("/login");
  }, [mounted, token, router]);

  if (!mounted || !token) return null;
  return <PortalLayout>{children}</PortalLayout>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";

import { AppLogo } from "@/components/app-logo";
import { NotificationBell } from "@/components/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students", href: "/students" },
  { label: "Meal Plan", href: "/meal-plan" },
  { label: "Feedback", href: "/feedback" },
];

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const parent = useAuthStore((s) => s.parent);
  const hasSubscriptionStudent = useAuthStore(
    (s) => s.parent?.has_subscription_student ?? false,
  );

  const visibleNavLinks = navLinks.filter(
    (link) => link.href !== "/meal-plan" || hasSubscriptionStudent,
  );

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // continue regardless
    }
    useAuthStore.getState().logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/dashboard" aria-label="Sunbites Portal home">
            <AppLogo variant="full" />
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {visibleNavLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: notification bell + user dropdown + mobile menu button */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            {/* User dropdown (desktop) */}
            {parent && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted md:flex"
                  aria-label="Account menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {parent.first_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {parent.first_name} {parent.last_name}
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              className="flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted md:hidden"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile slide-down nav drawer */}
        {mobileNavOpen && (
          <div
            id="mobile-nav"
            className="border-t border-border bg-card md:hidden"
          >
            <nav
              className="mx-auto max-w-7xl space-y-1 px-4 py-3"
              aria-label="Mobile navigation"
            >
              {visibleNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "font-semibold text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile user section */}
              {parent && (
                <>
                  <div className="my-2 border-t border-border" />
                  <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                    {parent.first_name} {parent.last_name}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  Calculator,
  FolderOpen,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/apply",
    label: "Apply for Loan",
    icon: FileText,
  },
  {
    href: "/loans",
    label: "Loan Tracking",
    icon: FolderOpen,
  },
  {
    href: "/calculator",
    label: "EMI Calculator",
    icon: Calculator,
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8D79C7] to-[#6E5BA8]">
        <ShieldCheck
          className="h-5 w-5 text-white"
          strokeWidth={2.5}
        />
      </div>

      <div>
        <p className="text-lg font-bold tracking-tight text-white">
          Credora
        </p>

        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/45">
          Digital lending
        </p>
      </div>
    </Link>
  );
}

function initials(
  name: string | null | undefined,
  email: string | null | undefined
) {
  const base =
    name && name.trim().length > 0
      ? name
      : email || "";

  return (
    base
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const result = await signOut();

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Signed out successfully");

      setMobileOpen(false);

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      toast.error("Unable to sign out. Please try again.");

      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-background">


      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#17213A] text-white lg:flex">


        <div className="flex h-20 items-center px-6">
          <Logo />
        </div>



        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Workspace
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-[#8D79C7] text-white shadow-lg shadow-[#8D79C7]/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    active
                      ? "text-white"
                      : "text-white/50 group-hover:text-white"
                  )}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>



        <div className="border-t border-white/10 p-4">


          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="mb-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-[18px] w-[18px]" />

            <span>
              {loggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>



          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck
                size={15}
                className="text-[#C8B8F2]"
              />

              <span className="text-xs font-semibold text-white">
                Need help?
              </span>
            </div>

            <p className="text-[11px] leading-5 text-white/45">
              Our support team is here if you need
              assistance.
            </p>

            <a
              href="mailto:support@credora.com"
              className="mt-3 block text-[11px] font-medium text-[#C8B8F2] transition hover:text-white"
            >
              support@credora.com
            </a>
          </div>
        </div>
      </aside>



      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />



          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[#17213A] text-white shadow-2xl">


            <div className="flex h-20 items-center justify-between px-5">
              <Logo />

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>



            <nav className="flex-1 space-y-1 px-3 py-5">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Workspace
              </p>

              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-[#8D79C7] text-white shadow-lg shadow-[#8D79C7]/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />

                    {item.label}
                  </Link>
                );
              })}
            </nav>



            <div className="border-t border-white/10 p-5">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-[18px] w-[18px]" />

                <span>
                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </span>
              </button>

              <p className="mt-4 text-xs text-white/40">
                Secure digital lending
              </p>
            </div>
          </aside>
        </div>
      )}


      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">


        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#17213A]/10 bg-background/90 px-4 backdrop-blur-xl lg:px-8">


          <div className="flex items-center gap-3">


            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>



            <div className="lg:hidden">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8D79C7] to-[#6E5BA8]">
                  <ShieldCheck
                    className="h-4 w-4 text-white"
                    strokeWidth={2.5}
                  />
                </div>

                <span className="text-lg font-bold tracking-tight">
                  Credora
                </span>
              </Link>
            </div>



            <div className="hidden lg:block">
              <p className="text-xs font-medium text-muted-foreground">
                {pathname === "/dashboard"
                  ? "Overview"
                  : pathname === "/apply"
                  ? "Loan Application"
                  : pathname === "/loans"
                  ? "Loan Tracking"
                  : pathname === "/calculator"
                  ? "EMI Calculator"
                  : pathname === "/documents"
                  ? "Documents"
                  : pathname === "/profile"
                  ? "Profile"
                  : "Credora"}
              </p>
            </div>
          </div>



          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3 transition hover:bg-accent/30"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#EEE8FF] text-xs font-semibold text-[#6E5BA8]">
                    {initials(
                      profile?.full_name,
                      user?.email
                    )}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden max-w-[140px] truncate text-sm font-medium sm:block">
                  {profile?.full_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60"
            >


              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name ||
                      "Account"}
                  </p>

                  <p className="truncate text-xs leading-none text-muted-foreground">
                    {user?.email || "No email"}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />



              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>



              <DropdownMenuItem asChild>
                <Link
                  href="/documents"
                  className="cursor-pointer"
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Documents
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />



              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={loggingOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />

                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>



        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
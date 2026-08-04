"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type AppShellProps = {
  user: {
    user_name: string;
    email: string;
    role_name: string;
  };
  children: ReactNode;
};

export default function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDashboard = pathname === "/dashboard";
  const isJobs = pathname === "/jobs" || pathname.startsWith("/jobs/");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function handleResize(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    }

    mediaQuery.addEventListener("change", handleResize);

    if (mediaQuery.matches) {
      setIsMobileMenuOpen(false);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      return;
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 z-50 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-slate-100 px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-blue-600"
          >
            <span className="text-3xl leading-none">🪐</span>
            <span>Life Hub</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-8">
          <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hub
          </p>

          <SidebarLink
            href="/dashboard"
            active={isDashboard}
            icon="▦"
            label="Overview"
          />

          <p className="mb-2 mt-8 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Modules
          </p>

          <SidebarLink
            href="/jobs"
            active={isJobs}
            icon="☑"
            label="To-Do List"
            badge="App"
          />

          <SoonLink icon="🥃" label="Drink Log" />
          <SoonLink icon="🌱" label="Habits" />
          <SoonLink icon="💸" label="Wallet" />
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xl font-bold text-blue-600"
              >
                <span className="text-3xl leading-none">🪐</span>
                <span>Life Hub</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-8">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Hub
              </p>

              <SidebarLink
                href="/dashboard"
                active={isDashboard}
                icon="▦"
                label="Overview"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <p className="mb-2 mt-8 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Modules
              </p>

              <SidebarLink
                href="/jobs"
                active={isJobs}
                icon="☑"
                label="To-Do List"
                badge="App"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <SoonLink icon="🥃" label="Drink Log" />
              <SoonLink icon="🌱" label="Habits" />
              <SoonLink icon="💸" label="Wallet" />
            </nav>

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                  {getInitial(user.user_name)}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {user.user_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isLoggingOut ? "Logging out..." : "Tap to logout"}
                  </p>
                </div>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col pb-24 lg:pl-64 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:h-20 lg:px-10">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="-ml-2 rounded-lg p-2 text-2xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="relative hidden max-w-md flex-1 lg:block">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              🔎
            </span>
            <input
              type="text"
              placeholder="Search anything in your Hub..."
              className="w-full rounded-full border border-transparent bg-slate-100 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 lg:gap-5">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border border-white bg-red-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 lg:block" />

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 transition-opacity hover:opacity-80 disabled:opacity-50"
              title="Logout"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                {getInitial(user.user_name)}
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-tight text-slate-800">
                  {user.user_name}
                </p>
                <p className="text-[11px] leading-tight text-slate-400">
                  {isLoggingOut ? "Logging out..." : user.role_name}
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-slate-200 bg-white/90 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md lg:hidden">
        <BottomLink
          href="/dashboard"
          active={isDashboard}
          icon="▦"
          label="Hub"
        />

        <BottomLink href="/jobs" active={isJobs} icon="☑" label="To-Do" />

        <div className="relative -top-6">
          <Link
        href="/jobs/new"
            prefetch={false}
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/40 transition-transform active:scale-95"
            >
            +
        </Link>
        </div>

        <button
          type="button"
          className="flex h-12 w-16 flex-col items-center justify-center text-slate-400 hover:text-slate-800"
        >
          <span className="text-2xl">🥃</span>
          <span className="text-[10px] font-medium">Drinks</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-12 w-16 flex-col items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-50"
        >
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-medium">
            {isLoggingOut ? "Logout..." : "Profile"}
          </span>
        </button>
      </nav>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  active: boolean;
  icon: string;
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={[
        "flex items-center rounded-xl px-4 py-3 font-medium transition-colors",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
    >
      <span className="mr-3 text-xl">{icon}</span>
      <span>{label}</span>

      {badge ? (
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function SoonLink({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex cursor-not-allowed items-center rounded-xl px-4 py-3 font-medium text-slate-400">
      <span className="mr-3 text-xl">{icon}</span>
      <span>{label}</span>
      <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
        Soon
      </span>
    </div>
  );
}

function BottomLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={[
        "flex h-12 w-16 flex-col items-center justify-center",
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-800",
      ].join(" ")}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
    </Link>
  );
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

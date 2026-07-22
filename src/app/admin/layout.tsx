"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  if (!mounted) return null;
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={18} className="text-ink" strokeWidth={1.5} />
      ) : (
        <Moon size={18} className="text-ink" strokeWidth={1.5} />
      )}
    </button>
  );
}

function LogoutConfirmModal({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-up"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="fade-up relative w-full max-w-sm bg-white dark:bg-[#201d19] border border-default rounded-2xl p-6 shadow-[0_20px_60px_-15px_rgba(13,12,10,0.3)]"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <LogOut size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 id="logout-confirm-title" className="text-lg font-bold text-ink">
            Log out?
          </h2>
        </div>
        <p className="text-sm text-muted mb-6">
          You&apos;ll need to sign in again to access the admin panel.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-default text-ink hover:bg-paper transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [adminName] = useState("Admin");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
    // layout stays mounted across /admin/login navigation, so reset modal state
    setShowLogoutConfirm(false);
    setLoggingOut(false);
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") {
    return <div className="min-h-screen flex flex-col bg-paper text-ink">{children}</div>;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-paper text-ink">
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          loading={loggingOut}
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-default bg-white dark:bg-[#1f1f1f]">
        <div className="h-16 flex flex-col justify-center px-6 border-b border-default">
          <Image
            src={mounted && isDark ? "/images/logo-light.png" : "/images/logo1.png"}
            alt="Bodhanam"
            height={32}
            width={130}
            priority
            className="h-7 w-auto"
          />
          <div className="text-xs text-muted leading-tight mt-1">Admin</div>
        </div>

        <nav className="p-6 space-y-2">
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/issues", label: "Issues" },
            { href: "/admin/articles", label: "Articles" },
            { href: "/admin/pages/about/edit", label: "About Page" },
            { href: "/admin/settings", label: "Contact & Settings" },
          ].map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-primary/10 text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-default p-6 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 rounded-lg hover:bg-primary/10 text-ink transition-colors text-sm"
          >
            View Site ↗
          </a>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-default bg-white dark:bg-[#1f1f1f] flex items-center justify-between px-8">
          <div className="text-sm text-muted">
            Logged in as <span className="font-medium text-ink">{adminName}</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

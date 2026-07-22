"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  BookOpen,
  FileText,
  Info,
  Settings,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/issues", label: "Issues", icon: BookOpen },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/pages/about/edit", label: "About Page", icon: Info },
  { href: "/admin/settings", label: "Contact & Settings", icon: Settings },
];

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
      className="p-2.5 rounded-xl border border-default hover:bg-primary/10 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={17} className="text-ink" strokeWidth={1.5} />
      ) : (
        <Moon size={17} className="text-ink" strokeWidth={1.5} />
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // close drawer + user menu on navigation
  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [pathname]);

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

  const activeItem = NAV_ITEMS.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  return (
    <div className="h-screen flex overflow-hidden bg-paper text-ink">
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          loading={loggingOut}
        />
      )}

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — static on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-default bg-white dark:bg-[#1a1a1a] transform transition-transform duration-200 lg:static lg:translate-x-0 lg:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo — roomy block so it never squishes */}
        <div className="px-6 pt-7 pb-6 border-b border-default flex items-start justify-between">
          <div>
            <Image
              src={mounted && isDark ? "/images/logo-light.png" : "/images/logo1.png"}
              alt="Bodhanam"
              height={40}
              width={160}
              priority
              className="h-9 w-auto"
            />
            <div className="mt-2 text-[11px] font-medium tracking-[0.18em] uppercase text-muted">
              Admin Panel
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 -mr-2 rounded-lg text-muted hover:text-ink"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-ink hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-default p-4 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-ink hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ExternalLink size={18} strokeWidth={1.5} className="shrink-0" />
            View Site
          </a>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <LogOut size={18} strokeWidth={1.5} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-16 shrink-0 border-b border-default bg-white dark:bg-[#1a1a1a] flex items-center justify-between px-4 sm:px-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl border border-default text-ink hover:bg-primary/10"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <div className="text-sm font-medium text-ink truncate">
              {activeItem?.label ?? "Admin"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* User menu */}
            <div className="relative pl-3 border-l border-default">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-primary/5 transition-colors"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {adminName.charAt(0)}
                </div>
                <div className="leading-tight text-left hidden sm:block">
                  <div className="text-sm font-semibold text-ink">{adminName}</div>
                  <div className="text-[11px] text-muted">Administrator</div>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-default bg-white dark:bg-[#242424] shadow-[0_16px_40px_-12px_rgba(13,12,10,0.25)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-default">
                      <div className="text-sm font-semibold text-ink">{adminName}</div>
                      <div className="text-xs text-muted">Administrator</div>
                    </div>
                    <div className="p-1.5">
                      <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-primary/5 hover:text-primary transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <ExternalLink size={16} strokeWidth={1.5} />
                        View Site
                      </a>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                      >
                        <LogOut size={16} strokeWidth={1.5} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

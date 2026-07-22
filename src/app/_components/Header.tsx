"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import BotanicalDecoration from "./BotanicalDecoration";
import HeaderSearch from "./HeaderSearch";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Archives", href: "/archives" },
  { label: "Authors", href: "/authors" },
  { label: "About", href: "/about" },
];

function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Client-only flag without an effect-driven setState (avoids a hydration mismatch
// on isDark-dependent markup below, per React's useSyncExternalStore guidance).
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const pathname = usePathname();

  // Tall header at top of page, compact sticky header once scrolled —
  // mirrors the original bodhanam.net two-state header.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    // Hysteresis: shrink past 80px, expand only back under 20px. A single
    // threshold flickers — shrinking the header shortens the page, scrollY
    // dips back below the threshold, and the header oscillates.
    const onScroll = () =>
      setScrolled((prev) => (prev ? window.scrollY > 20 : window.scrollY > 80));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b-2"
      style={{
        backgroundColor: "var(--header-bg)",
        borderColor: "var(--primary)",
      }}
    >
      {/* Clip the decoration here instead of on <header> so the search
          suggestions dropdown isn't cut off. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <BotanicalDecoration className="hidden sm:block absolute -left-6 -top-10 h-32 w-32 opacity-60 lg:h-40 lg:w-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-[height] duration-300 ${
            scrolled ? "h-14 md:h-16" : "h-20 md:h-24"
          }`}
        >
          {/* Logo with image */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity duration-300"
          >
            <Image
              src={mounted && isDark ? "/images/logo-light.png" : "/images/logo1.png"}
              alt="Bodhanam"
              height={56}
              width={227}
              priority
              className={`w-auto transition-all duration-300 ${
                scrolled ? "h-9 md:h-10" : "h-12 md:h-16"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium tracking-wide text-ink hover:text-primary transition-colors duration-300 relative group py-1"
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Inline search field on desktop; icon toggle on mobile */}
            <div className="hidden md:block">
              <HeaderSearch />
            </div>
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 hover:bg-primary hover:bg-opacity-5 rounded transition-colors duration-300"
              aria-label="Toggle search"
            >
              <Search size={18} className="text-ink" strokeWidth={1.5} />
            </button>
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2 hover:bg-primary hover:bg-opacity-5 rounded transition-colors duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun size={18} className="text-ink" strokeWidth={1.5} />
                ) : (
                  <Moon size={18} className="text-ink" strokeWidth={1.5} />
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-primary hover:bg-opacity-5 rounded transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={20} className="text-ink" strokeWidth={1.5} />
              ) : (
                <Menu size={20} className="text-ink" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search field */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <HeaderSearch autoFocus onNavigate={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="px-0 py-4 space-y-1">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm font-medium hover:text-primary hover:bg-primary hover:bg-opacity-5 transition-colors duration-200 ${
                      active ? "text-primary" : "text-ink"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                className="block px-4 py-2.5 text-sm font-medium text-ink hover:text-primary hover:bg-primary hover:bg-opacity-5 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>

    </header>
  );
}

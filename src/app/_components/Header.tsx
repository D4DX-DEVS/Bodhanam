"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import BotanicalDecoration from "./BotanicalDecoration";
import SearchOverlay from "./SearchOverlay";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Archives", href: "/archives" },
  { label: "Authors", href: "/authors" },
  { label: "About", href: "/about" },
];

function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

interface HeaderProps {
  topics?: Array<{ id: number; name: string }>;
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

export default function Header({ topics = [] }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b overflow-hidden"
      style={{
        backgroundColor: "var(--header-bg)",
        borderColor: "var(--border)",
      }}
    >
      <BotanicalDecoration className="hidden sm:block absolute -left-6 -top-10 h-32 w-32 opacity-60 lg:h-40 lg:w-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with image */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity duration-300"
          >
            <Image
              src={mounted && isDark ? "/images/logo-light.png" : "/images/logo1.png"}
              alt="Bodhanam"
              height={36}
              width={146}
              priority
              className="h-9 w-auto"
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
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-primary hover:bg-opacity-5 rounded transition-colors duration-300"
              aria-label="Search"
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} topics={topics} />
    </header>
  );
}

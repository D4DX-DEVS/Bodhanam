"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LibraryBig, UsersRound, BadgeInfo, Mail } from "lucide-react";

const items = [
  { label: "Home", href: "/", icon: House },
  { label: "Archives", href: "/archives", icon: LibraryBig },
  { label: "Authors", href: "/authors", icon: UsersRound },
  { label: "About", href: "/about", icon: BadgeInfo },
  { label: "Contact", href: "/contact", icon: Mail },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Mobile-only floating tab bar; replaces the hamburger menu under md. */
export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 z-50 rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden"
      style={{
        bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        backgroundColor: "color-mix(in srgb, var(--paper-elevated) 88%, transparent)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <ul className="grid grid-cols-5 p-1.5">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-medium transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted hover:text-ink"
                }`}
                style={
                  active
                    ? { backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }
                    : undefined
                }
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.6}
                  className={`transition-transform duration-200 ${active ? "-translate-y-px" : ""}`}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

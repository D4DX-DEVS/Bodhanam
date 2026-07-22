import { getContact } from "@/lib/data";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import BotanicalDecoration from "./BotanicalDecoration";

const EXPLORE_LINKS = [
  { label: "Archives", href: "/archives" },
  { label: "Authors", href: "/authors" },
];

const INFO_LINKS = [
  { label: "About Bodhanam", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

function ContactBlock({
  label,
  contact,
}: {
  label: string;
  contact: { address?: string; phone?: string; email?: string };
}) {
  return (
    <div>
      <h4 className="font-sans-ml font-bold mb-4 text-sm uppercase tracking-widest text-[var(--footer-ink)]">
        {label}
      </h4>
      <div className="space-y-3">
        {contact.address && (
          <div className="flex gap-2 items-start text-sm" style={{ color: "var(--footer-muted)" }}>
            <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--footer-accent)" }} />
            <p>{contact.address}</p>
          </div>
        )}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex gap-2 items-center text-sm transition-colors duration-300 hover:text-[var(--footer-ink)]"
            style={{ color: "var(--footer-muted)" }}
          >
            <Phone size={16} className="flex-shrink-0" style={{ color: "var(--footer-accent)" }} />
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex gap-2 items-center text-sm break-all transition-colors duration-300 hover:text-[var(--footer-ink)]"
            style={{ color: "var(--footer-muted)" }}
          >
            <Mail size={16} className="flex-shrink-0" style={{ color: "var(--footer-accent)" }} />
            {contact.email}
          </a>
        )}
      </div>
    </div>
  );
}

export default async function Footer() {
  const contact = await getContact();

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--footer-bg)", color: "var(--footer-ink)" }}
    >
      <BotanicalDecoration
        colorVar="--footer-accent"
        className="hidden md:block absolute -right-10 -bottom-12 h-52 w-52 opacity-30"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-8 md:mb-10">
          <div>
            <h3 className="font-serif-ml text-2xl md:text-3xl font-bold mb-3">ബോധനം</h3>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--footer-muted)" }}>
              An Islamic quarterly journal exploring contemporary scholarship, spirituality, and
              thought.
            </p>
          </div>

          <div>
            <h4 className="font-sans-ml font-bold mb-4 text-sm uppercase tracking-widest">
              Explore
            </h4>
            <div className="space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm transition-colors duration-300 hover:text-[var(--footer-ink)]"
                  style={{ color: "var(--footer-muted)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-sans-ml font-bold mb-4 text-sm uppercase tracking-widest">
              Information
            </h4>
            <div className="space-y-3">
              {INFO_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm transition-colors duration-300 hover:text-[var(--footer-ink)]"
                  style={{ color: "var(--footer-muted)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {contact?.editorial && Object.keys(contact.editorial).length > 0 && (
            <ContactBlock label={contact.editorial.label || "Editorial"} contact={contact.editorial} />
          )}
          {contact?.manager && Object.keys(contact.manager).length > 0 && (
            <ContactBlock label={contact.manager.label || "Manager"} contact={contact.manager} />
          )}
        </div>

        <div className="border-t pt-6 md:pt-8" style={{ borderColor: "var(--footer-border)" }}>
          <div className="text-center text-xs md:text-sm space-y-2" style={{ color: "var(--footer-muted)" }}>
            <p>© 2026 · Bodhanam Quarterly · All rights reserved</p>
            <p>
              Developed by{" "}
              <a
                href="https://d4dx.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors duration-300 hover:text-[var(--footer-ink)]"
                style={{ color: "var(--footer-accent)" }}
              >
                D4DX Innovation LLP
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

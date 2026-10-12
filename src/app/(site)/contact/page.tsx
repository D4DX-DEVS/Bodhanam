import { getContact } from "@/lib/data";
import ContactForm from "@/app/_components/ContactForm";
import { Metadata } from "next";
import { Phone, Mail, MapPin, UsersRound, Building2, Newspaper, Send, type LucideIcon } from "lucide-react";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Contact the editorial and management offices of ബോധനം (Bodhanam) Islamic quarterly, Kerala.",
  path: "/contact",
});

interface ContactInfo {
  label?: string;
  address?: string;
  phone?: string;
  email?: string;
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary"
      style={{ backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
    >
      <Icon size={18} strokeWidth={1.75} />
    </span>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <IconTile icon={icon} />
      <div className="min-w-0">
        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className={`break-words text-sm ${href ? "text-primary group-hover:text-primary-light" : "text-ink"}`}>
          {value}
        </p>
      </div>
    </>
  );
  return href ? (
    <a href={href} className="group flex items-center gap-3">
      {inner}
    </a>
  ) : (
    <div className="flex items-center gap-3">{inner}</div>
  );
}

function ContactCard({ title, icon, info }: { title: string; icon: LucideIcon; info: ContactInfo }) {
  return (
    <div
      className="rounded-2xl border p-5 transition-shadow duration-300 hover:shadow-md sm:p-7 md:p-8"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
    >
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <IconTile icon={icon} />
        <h2 className="font-serif-ml text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      </div>
      <div className="space-y-4">
        {info.address && <ContactRow icon={MapPin} label="Address" value={info.address} />}
        {info.phone && (
          <ContactRow icon={Phone} label="Phone" value={info.phone} href={`tel:${info.phone}`} />
        )}
        {info.email && (
          <ContactRow icon={Mail} label="Email" value={info.email} href={`mailto:${info.email}`} />
        )}
      </div>
    </div>
  );
}

/** "V.K. Ali (Chief Editor)" → { name: "V.K. Ali", role: "Chief Editor" } */
function parseMember(raw: string): { name: string; role?: string } {
  const m = raw.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1], role: m[2] } : { name: raw.trim() };
}

function initials(name: string): string {
  const words = name
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, "")
    .split(/[\s.]+/)
    .filter(Boolean);
  const last = words[words.length - 1] ?? "";
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? last[0] : "")).toUpperCase();
}

export default async function ContactPage() {
  const contact = await getContact();
  const team = (contact?.team ?? []).map(parseMember);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <div className="mb-8 md:mb-16">
          <h1 className="mb-3 font-serif-ml text-3xl font-bold leading-tight text-ink sm:text-4xl md:mb-4 md:text-5xl lg:text-6xl">
            ബന്ധപ്പെടുക
          </h1>
          <p className="max-w-2xl font-sans-ml text-sm text-muted sm:text-base">
            Have a question or suggestion? We&apos;d love to hear from you. Reach out to our editorial team.
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:gap-6 md:mb-20 md:grid-cols-2 lg:gap-8">
          {contact?.editorial && (
            <ContactCard
              title={contact.editorial.label || "Editorial Board"}
              icon={Newspaper}
              info={contact.editorial}
            />
          )}
          {contact?.manager && (
            <ContactCard
              title={contact.manager.label || "Manager"}
              icon={Building2}
              info={contact.manager}
            />
          )}
        </div>

        {/* Editorial Team */}
        {team.length > 0 && (
          <div className="mb-10 md:mb-20">
            <div className="mb-4 flex items-center gap-3 md:mb-8">
              <IconTile icon={UsersRound} />
              <h2 className="font-serif-ml text-xl font-bold text-ink sm:text-2xl md:text-3xl">
                Editorial Team
              </h2>
            </div>
            <ul
              className="divide-y overflow-hidden rounded-2xl border bg-[var(--paper-elevated)] sm:grid sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent lg:grid-cols-3"
              style={{ borderColor: "var(--border)" }}
            >
              {team.map((member, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 sm:rounded-2xl sm:border sm:bg-[var(--paper-elevated)] sm:p-5"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-primary"
                    style={{ backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
                  >
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans-ml text-sm font-medium text-ink sm:text-base">
                      {member.name}
                    </p>
                    {member.role && (
                      <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-medium text-primary"
                        style={{ backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
                      >
                        {member.role}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Form */}
        <div
          className="rounded-2xl border p-5 sm:p-7 md:p-8 lg:p-10"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
        >
          <div className="mb-6 flex items-center gap-3 md:mb-8">
            <IconTile icon={Send} />
            <h2 className="font-serif-ml text-xl font-bold text-ink sm:text-2xl md:text-3xl">
              Send a Message
            </h2>
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

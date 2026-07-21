import { getContact } from "@/lib/data";
import ContactForm from "@/app/_components/ContactForm";
import { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Bodhanam",
};

export default async function ContactPage() {
  const contact = await getContact();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="mb-12 md:mb-16">
          <h1 className="font-serif-ml text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-4 leading-tight">
            ബന്ധപ്പെടുക
          </h1>
          <p className="text-muted font-sans-ml max-w-2xl">
            Have a question or suggestion? We'd love to hear from you. Reach out to our editorial team.
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16 md:mb-20">
          {contact?.editorial && (
            <div
              className="border rounded-lg p-7 md:p-8 transition-all duration-300 hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--paper-elevated)",
              }}
            >
              <h2 className="font-serif-ml text-2xl font-bold text-ink mb-6">
                {contact.editorial.label || "Editorial Board"}
              </h2>
              <div className="space-y-4">
                {contact.editorial.address && (
                  <div className="flex gap-3">
                    <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide mb-1">
                        Address
                      </p>
                      <p className="text-sm text-ink">{contact.editorial.address}</p>
                    </div>
                  </div>
                )}
                {contact.editorial.phone && (
                  <a
                    href={`tel:${contact.editorial.phone}`}
                    className="flex gap-3 group"
                  >
                    <Phone size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide mb-1">
                        Phone
                      </p>
                      <p className="text-sm text-primary group-hover:text-primary-light transition-colors duration-300">
                        {contact.editorial.phone}
                      </p>
                    </div>
                  </a>
                )}
                {contact.editorial.email && (
                  <a
                    href={`mailto:${contact.editorial.email}`}
                    className="flex gap-3 group"
                  >
                    <Mail size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide mb-1">
                        Email
                      </p>
                      <p className="text-sm text-primary group-hover:text-primary-light transition-colors duration-300">
                        {contact.editorial.email}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {contact?.manager && (
            <div
              className="border rounded-lg p-7 md:p-8 transition-all duration-300 hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--paper-elevated)",
              }}
            >
              <h2 className="font-serif-ml text-2xl font-bold text-ink mb-6">
                {contact.manager.label || "Manager"}
              </h2>
              <div className="space-y-4">
                {contact.manager.address && (
                  <div className="flex gap-3">
                    <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide mb-1">
                        Address
                      </p>
                      <p className="text-sm text-ink">{contact.manager.address}</p>
                    </div>
                  </div>
                )}
                {contact.manager.phone && (
                  <a
                    href={`tel:${contact.manager.phone}`}
                    className="flex gap-3 group"
                  >
                    <Phone size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide mb-1">
                        Phone
                      </p>
                      <p className="text-sm text-primary group-hover:text-primary-light transition-colors duration-300">
                        {contact.manager.phone}
                      </p>
                    </div>
                  </a>
                )}
                {contact.manager.email && (
                  <a
                    href={`mailto:${contact.manager.email}`}
                    className="flex gap-3 group"
                  >
                    <Mail size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-sans-ml font-medium text-muted uppercase tracking-wide mb-1">
                        Email
                      </p>
                      <p className="text-sm text-primary group-hover:text-primary-light transition-colors duration-300">
                        {contact.manager.email}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Editorial Team */}
        {contact?.team && contact.team.length > 0 && (
          <div className="mb-16 md:mb-20">
            <h2 className="font-serif-ml text-2xl md:text-3xl font-bold text-ink mb-8">
              Editorial Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {contact.team.map((member, idx) => (
                <div
                  key={idx}
                  className="p-5 md:p-6 border rounded-lg"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="font-sans-ml font-medium text-ink">{member}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div
          className="border rounded-lg p-7 md:p-8 lg:p-10"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--paper-elevated)",
          }}
        >
          <h2 className="font-serif-ml text-2xl md:text-3xl font-bold text-ink mb-8">
            Send a Message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

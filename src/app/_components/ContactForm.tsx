"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.ok) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been sent.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to send message",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-sans-ml font-medium text-ink mb-2"
          >
            പേര്
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-default rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-sans-ml font-medium text-ink mb-2"
          >
            ഇമെയിൽ
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-default rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-sans-ml font-medium text-ink mb-2"
        >
          വിഷയം
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-default rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Subject"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-sans-ml font-medium text-ink mb-2"
        >
          സന്ദേശം
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-2 border border-default rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Your message..."
        />
      </div>

      {status.type !== "idle" && (
        <div
          className={`p-4 rounded-lg ${
            status.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : status.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={status.type === "loading"}
        className="w-full px-6 py-3 bg-primary text-paper font-sans-ml font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: status.type === "loading" ? 'var(--primary)' : 'var(--primary)',
          opacity: status.type === "loading" ? 0.5 : 1
        }}
      >
        {status.type === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

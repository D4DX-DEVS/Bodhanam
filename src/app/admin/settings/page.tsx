"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { updateSettingAction, changePasswordAction } from "@/app/admin/actions";

interface ContactSettings {
  editorial?: { label?: string; address?: string; phone?: string; email?: string };
  manager?: { label?: string; address?: string; phone?: string; email?: string };
  team?: string[];
}

const TABS = ["Account", "Editorial Contact", "Manager Contact"] as const;
type Tab = (typeof TABS)[number];

const inputCls =
  "w-full px-4 py-2.5 border border-default rounded-xl text-sm text-ink bg-paper focus:ring-2 focus:ring-primary focus:border-transparent outline-none";

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (next !== confirm) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    const result = await changePasswordAction(current, next);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess("Password updated.");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white dark:bg-[#242424] border border-default rounded-2xl"
    >
      <h2 className="text-lg font-bold text-ink">Change Password</h2>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-2">Current Password</label>
        <input
          type={showPasswords ? "text" : "password"}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputCls}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">New Password</label>
        <input
          type={showPasswords ? "text" : "password"}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={inputCls}
          minLength={12}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Confirm New Password</label>
        <input
          type={showPasswords ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
          minLength={12}
          required
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPasswords ? "Hide" : "Show"} passwords
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 btn-primary rounded-xl font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}

function ContactFields({
  value,
  onChange,
}: {
  value: { label?: string; address?: string; phone?: string; email?: string };
  onChange: (v: { label?: string; address?: string; phone?: string; email?: string }) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Label</label>
        <input
          type="text"
          value={value.label ?? ""}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Address</label>
        <input
          type="text"
          value={value.address ?? ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Phone</label>
        <input
          type="text"
          value={value.phone ?? ""}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Email</label>
        <input
          type="email"
          value={value.email ?? ""}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          className={inputCls}
        />
      </div>
    </>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [contact, setContact] = useState<ContactSettings>({});

  useEffect(() => {
    fetch("/api/admin/settings/contact")
      .then((r) => r.json())
      .then((data) => setContact(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      await updateSettingAction("contact", JSON.stringify(contact));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Contact & Settings</h1>
        <p className="text-muted mt-1">Manage your account and contact details.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-default">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Account" && <ChangePasswordForm />}

      {tab !== "Account" && (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 mb-6 text-sm">
              {error}
            </div>
          )}
          {saved && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 mb-6 text-sm">
              Settings saved.
            </div>
          )}

          <div className="space-y-4 p-6 bg-white dark:bg-[#242424] border border-default rounded-2xl">
            <h2 className="text-lg font-bold text-ink">
              {tab === "Editorial Contact" ? "Editorial Contact" : "Manager Contact"}
            </h2>
            {tab === "Editorial Contact" ? (
              <ContactFields
                value={contact.editorial ?? {}}
                onChange={(editorial) => setContact({ ...contact, editorial })}
              />
            ) : (
              <ContactFields
                value={contact.manager ?? {}}
                onChange={(manager) => setContact({ ...contact, manager })}
              />
            )}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 btn-primary rounded-xl font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

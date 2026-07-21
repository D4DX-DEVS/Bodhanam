"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { updateSettingAction, changePasswordAction } from "@/app/admin/actions";

interface ContactSettings {
  editorial?: { label?: string; address?: string; phone?: string; email?: string };
  manager?: { label?: string; address?: string; phone?: string; email?: string };
  team?: string[];
}

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
    <div className="space-y-4 p-6 bg-white dark:bg-[#2a2a2a] border border-default rounded-lg">
      <h2 className="text-lg font-bold text-ink">Change Password</h2>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300 text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-2">Current Password</label>
        <input
          type={showPasswords ? "text" : "password"}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
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
          className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
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
          className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
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
          className="px-6 py-2 btn-primary rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
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
      <h1 className="text-4xl font-bold text-ink mb-8">Contact & Settings</h1>

      <div className="mb-8">
        <ChangePasswordForm />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 mb-6">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300 mb-6">
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Editorial */}
        <div className="space-y-4 p-6 bg-white dark:bg-[#2a2a2a] border border-default rounded-lg">
          <h2 className="text-lg font-bold text-ink">Editorial Contact</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Label</label>
            <input
              type="text"
              value={contact.editorial?.label ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  editorial: { ...contact.editorial, label: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Address</label>
            <input
              type="text"
              value={contact.editorial?.address ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  editorial: { ...contact.editorial, address: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Phone</label>
            <input
              type="text"
              value={contact.editorial?.phone ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  editorial: { ...contact.editorial, phone: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Email</label>
            <input
              type="email"
              value={contact.editorial?.email ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  editorial: { ...contact.editorial, email: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
        </div>

        {/* Manager */}
        <div className="space-y-4 p-6 bg-white dark:bg-[#2a2a2a] border border-default rounded-lg">
          <h2 className="text-lg font-bold text-ink">Manager Contact</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Label</label>
            <input
              type="text"
              value={contact.manager?.label ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  manager: { ...contact.manager, label: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Address</label>
            <input
              type="text"
              value={contact.manager?.address ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  manager: { ...contact.manager, address: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Phone</label>
            <input
              type="text"
              value={contact.manager?.phone ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  manager: { ...contact.manager, phone: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Email</label>
            <input
              type="email"
              value={contact.manager?.email ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  manager: { ...contact.manager, email: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-default rounded-lg text-ink bg-paper"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2 btn-primary rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePageAction } from "@/app/admin/actions";
import Editor from "@/app/admin/_components/Editor";

export default function EditAboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState({
    title: "About",
    bodyHtml: "",
  });

  useEffect(() => {
    fetch("/api/admin/pages/about")
      .then((r) => r.json())
      .then((data) => {
        setPage(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load page");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updatePageAction("about", {
        title: page.title,
        bodyHtml: page.bodyHtml,
      });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">About Page</h1>
          <p className="text-muted mt-1">Edit your website about page content.</p>
        </div>
        <button
          type="submit"
          form="about-form"
          disabled={saving}
          className="px-5 py-2.5 btn-primary rounded-xl font-medium text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 mb-6">
          {error}
        </div>
      )}

      <form id="about-form" onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-[#242424] border border-default rounded-2xl">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Title
          </label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Content
          </label>
          <Editor
            value={page.bodyHtml}
            onChange={(html) => setPage({ ...page, bodyHtml: html })}
          />
        </div>

      </form>
    </div>
  );
}

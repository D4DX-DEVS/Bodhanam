"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createIssueAction,
  updateIssueAction,
} from "@/app/admin/actions";
import ImageUpload from "./ImageUpload";

interface IssueFormProps {
  issue?: {
    id: number;
    volume: number | null;
    issueNo: number | null;
    period: string;
    description: string | null;
    coverImage: string | null;
    published: boolean;
  };
}

export default function IssueForm({ issue }: IssueFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    volume: issue?.volume ?? "",
    issueNo: issue?.issueNo ?? "",
    period: issue?.period ?? "",
    description: issue?.description ?? "",
    coverImage: issue?.coverImage ?? "",
  });

  const save = async (published: boolean) => {
    setLoading(true);
    setError("");

    try {
      if (!formData.period.trim()) {
        setError("Period is required");
        setLoading(false);
        return;
      }
      const payload = {
        volume: formData.volume ? parseInt(String(formData.volume)) : null,
        issueNo: formData.issueNo ? parseInt(String(formData.issueNo)) : null,
        period: formData.period,
        description: formData.description.trim() || null,
        coverImage: formData.coverImage || null,
        published,
      };
      if (issue) {
        await updateIssueAction(issue.id, payload);
      } else {
        await createIssueAction(payload);
      }
      router.push("/admin/issues");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {issue && (
        <div className="text-sm">
          Status:{" "}
          <span
            className={
              issue.published
                ? "font-medium text-green-600 dark:text-green-400"
                : "font-medium text-amber-600 dark:text-amber-400"
            }
          >
            {issue.published ? "Published" : "Draft"}
          </span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Volume
          </label>
          <input
            type="number"
            min="0"
            value={formData.volume}
            onChange={(e) =>
              setFormData({
                ...formData,
                volume: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Issue No
          </label>
          <input
            type="number"
            min="0"
            value={formData.issueNo}
            onChange={(e) =>
              setFormData({
                ...formData,
                issueNo: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Period
        </label>
        <input
          type="text"
          value={formData.period}
          onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          required
          className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          placeholder="Short blurb shown under the issue title on the home page"
          className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Cover Image
        </label>
        <ImageUpload
          value={formData.coverImage}
          onChange={(url) => setFormData({ ...formData, coverImage: url })}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={loading}
          className="flex-1 px-6 py-2 border border-default rounded-lg font-medium text-ink hover:bg-paper disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save as Draft"}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={loading}
          className="flex-1 px-6 py-2 btn-primary rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Publish"}
        </button>
      </div>
    </form>
  );
}

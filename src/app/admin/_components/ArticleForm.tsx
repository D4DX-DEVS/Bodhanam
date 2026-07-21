"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
} from "@/app/admin/actions";
import ImageUpload from "./ImageUpload";
import Editor from "./Editor";
import ConfirmDialog from "./ConfirmDialog";
import Select from "@/app/_components/Select";

interface IssueOption {
  id: number;
  volume: number | null;
  issueNo: number | null;
  period: string;
}

interface ArticleFormProps {
  issues: IssueOption[];
  article?: {
    id: number;
    title: string;
    author: string | null;
    category: string | null;
    excerpt: string | null;
    bodyHtml: string;
    coverImage: string | null;
    order: number;
    period: string | null;
    issueId: number;
    published: boolean | null;
    issue: { id: number; volume: number | null; issueNo: number | null } | null;
  };
}

export default function ArticleForm({ issues, article }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: article?.title ?? "",
    author: article?.author ?? "",
    category: article?.category ?? "",
    excerpt: article?.excerpt ?? "",
    bodyHtml: article?.bodyHtml ?? "",
    coverImage: article?.coverImage ?? "",
    order: article?.order != null ? String(article.order) : "",
    issueId: String(article?.issueId ?? ""),
  });

  const save = async (published: boolean) => {
    setLoading(true);
    setError("");

    try {
      if (!formData.title.trim()) {
        setError("Title is required");
        setLoading(false);
        return;
      }
      const issueId = parseInt(String(formData.issueId));
      if (!issueId) {
        setError("Please select an issue");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        author: formData.author || null,
        category: formData.category || null,
        excerpt: formData.excerpt || null,
        bodyHtml: formData.bodyHtml,
        coverImage: formData.coverImage || null,
        order: parseInt(String(formData.order)) || 0,
        period: null,
        issueId,
        published,
      };

      if (article) {
        await updateArticleAction(article.id, payload);
      } else {
        await createArticleAction(payload);
      }
      router.push("/admin/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    setConfirmDelete(false);
    setLoading(true);
    try {
      await deleteArticleAction(article.id);
      router.push("/admin/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {article && (
        <div className="text-sm">
          Status:{" "}
          <span
            className={
              article.published === false
                ? "font-medium text-amber-600 dark:text-amber-400"
                : "font-medium text-green-600 dark:text-green-400"
            }
          >
            {article.published === false ? "Draft" : "Published"}
          </span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Author
        </label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) =>
            setFormData({ ...formData, author: e.target.value })
          }
          className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Order
          </label>
          <input
            type="number"
            min="0"
            value={formData.order}
            onChange={(e) =>
              setFormData({
                ...formData,
                order: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Issue *
        </label>
        <Select
          value={formData.issueId}
          onValueChange={(v) => setFormData({ ...formData, issueId: v })}
          ariaLabel="Select an issue"
          className="w-full"
          options={issues.map((iss) => ({
            value: String(iss.id),
            label:
              iss.volume != null && iss.issueNo != null
                ? `Vol ${iss.volume} · Issue ${iss.issueNo} — ${iss.period}`
                : iss.period || `Issue ${iss.id}`,
          }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Excerpt
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) =>
            setFormData({ ...formData, excerpt: e.target.value })
          }
          rows={3}
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

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Content *
        </label>
        <Editor
          value={formData.bodyHtml}
          onChange={(html) => setFormData({ ...formData, bodyHtml: html })}
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
        {article && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-paper rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        message="Delete this article? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}

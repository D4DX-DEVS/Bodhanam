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
import CategoryCombobox from "./CategoryCombobox";
import Select from "@/app/_components/Select";

interface IssueOption {
  id: number;
  volume: number | null;
  issueNo: number | null;
  period: string;
}

interface ArticleFormProps {
  issues: IssueOption[];
  categorySuggestions?: string[];
  article?: {
    id: number;
    title: string;
    author: string | null;
    category: string | null;
    excerpt: string | null;
    bodyHtml: string;
    coverImage: string | null;
    order: number;
    covernum: number;
    slug: string | null;
    period: string | null;
    issueId: number;
    published: boolean | null;
    issue: { id: number; volume: number | null; issueNo: number | null } | null;
  };
}

const EMPTY_FORM = {
  title: "",
  author: "",
  category: "",
  excerpt: "",
  bodyHtml: "",
  coverImage: "",
  order: "",
  covernum: "",
  slug: "",
};

export default function ArticleForm({
  issues,
  categorySuggestions = [],
  article,
}: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [formData, setFormData] = useState({
    title: article?.title ?? "",
    author: article?.author ?? "",
    category: article?.category ?? "",
    excerpt: article?.excerpt ?? "",
    bodyHtml: article?.bodyHtml ?? "",
    coverImage: article?.coverImage ?? "",
    order: article?.order != null ? String(article.order) : "",
    covernum: article?.covernum ? String(article.covernum) : "",
    slug: article?.slug ?? "",
  });
  const [issueId, setIssueId] = useState(
    String(article?.issueId ?? issues[0]?.id ?? "")
  );

  const save = async () => {
    setLoading(true);
    setError("");

    try {
      if (!formData.title.trim()) {
        setError("Title is required");
        setLoading(false);
        return;
      }
      const issueIdNum = parseInt(issueId);
      if (!issueIdNum) {
        setError("Please select an issue");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        author: formData.author || null,
        category: formData.category.trim() || null,
        excerpt: formData.excerpt || null,
        bodyHtml: formData.bodyHtml,
        coverImage: formData.coverImage || null,
        order: parseInt(String(formData.order)) || 0,
        covernum: parseInt(String(formData.covernum)) || 0,
        slug: formData.slug.trim() || null,
        period: null,
        // Visibility is controlled by publishing the issue, not the article.
        published: true,
        issueId: issueIdNum,
      };

      let id: number;
      if (article) {
        await updateArticleAction(article.id, payload);
        id = article.id;
      } else {
        const created = await createArticleAction(payload);
        id = created.id;
      }
      setSavedId(id);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  };

  const startNewArticle = () => {
    setSavedId(null);
    if (article) {
      router.push("/admin/articles/new");
      return;
    }
    setFormData(EMPTY_FORM);
    setEditorKey((k) => k + 1); // remount editor to clear content
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
          <CategoryCombobox
            value={formData.category}
            onChange={(category) => setFormData({ ...formData, category })}
            suggestions={categorySuggestions}
            placeholder="Type your own or pick a suggestion"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Position (order in section)
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Cover story slot (optional)
          </label>
          <input
            type="number"
            min="0"
            max="6"
            value={formData.covernum}
            onChange={(e) =>
              setFormData({
                ...formData,
                covernum: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <p className="mt-1 text-xs text-muted">
            1–4 = home-page cover story in that slot. Empty = regular article.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Kicker label (cover story badge)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. ഫത്‌വ, പഠനം"
            className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Issue *
        </label>
        <Select
          value={issueId}
          onValueChange={setIssueId}
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
          key={editorKey}
          value={formData.bodyHtml}
          onChange={(html) => setFormData({ ...formData, bodyHtml: html })}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="flex-1 px-6 py-2 btn-primary rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
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

      {/* Post-save: what next? */}
      {savedId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#242424] border border-default p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Article saved</h2>
            <p className="text-sm text-muted">
              Publish happens from the Issue page once all articles are added.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={startNewArticle}
                className="px-5 py-2.5 btn-primary rounded-lg font-medium text-sm"
              >
                Add another article
              </button>
              <a
                href={`/articles/show/${savedId}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 border border-default rounded-lg font-medium text-sm text-center text-ink hover:border-primary hover:text-primary"
              >
                Preview article
              </a>
              <a
                href={`/admin/issues/${issueId}/preview`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 border border-default rounded-lg font-medium text-sm text-center text-ink hover:border-primary hover:text-primary"
              >
                Home page preview
              </a>
              <button
                type="button"
                onClick={() => router.push("/admin/articles")}
                className="px-5 py-2.5 border border-default rounded-lg font-medium text-sm text-ink hover:border-primary hover:text-primary"
              >
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        message="Delete this article? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setArticlePublishedAction } from "@/app/admin/actions";

export default function DraftPreviewBar({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const publish = async () => {
    setLoading(true);
    setError("");
    try {
      await setArticlePublishedAction(articleId, true);
      router.push("/admin/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-3 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-700 px-4 py-3 text-sm">
      <span className="font-medium text-amber-800 dark:text-amber-200">
        Draft preview — not visible to visitors
      </span>
      {error && <span className="text-red-600">{error}</span>}
      <div className="ml-auto flex items-center gap-3">
        <Link
          href={`/admin/articles/${articleId}/edit`}
          className="px-4 py-1.5 border border-amber-400 rounded-lg font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/40"
        >
          Keep as Draft / Edit
        </Link>
        <button
          type="button"
          onClick={publish}
          disabled={loading}
          className="px-4 py-1.5 btn-primary rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
}

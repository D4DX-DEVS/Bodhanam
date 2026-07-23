"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteIssueAction, deleteArticleAction } from "@/app/admin/actions";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteRowButton({
  kind,
  id,
}: {
  kind: "issue" | "article";
  id: number;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      if (kind === "issue") await deleteIssueAction(id);
      else await deleteArticleAction(id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        disabled={loading}
        title="Delete"
        className="p-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-600/10 transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmDialog
        open={confirm}
        message={
          kind === "issue"
            ? "Delete this issue and all its articles? This cannot be undone."
            : "Delete this article? This cannot be undone."
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setIssuePublishedAction } from "@/app/admin/actions";

export default function PublishIssueButton({ issueId }: { issueId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const publish = async () => {
    setLoading(true);
    setError("");
    try {
      await setIssuePublishedAction(issueId, true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <span className="text-red-600 text-sm">{error}</span>}
      <button
        type="button"
        onClick={publish}
        disabled={loading}
        className="px-4 py-1.5 btn-primary rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Now"}
      </button>
    </>
  );
}

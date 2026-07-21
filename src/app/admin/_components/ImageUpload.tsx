"use client";

import { useState } from "react";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Cover"
            className="w-full max-w-sm rounded-lg border border-default"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="flex-1 text-sm text-muted file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium file:cursor-pointer hover:file:bg-primary/90 disabled:opacity-60"
        />
        {isUploading && <span className="text-sm text-muted">Uploading...</span>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

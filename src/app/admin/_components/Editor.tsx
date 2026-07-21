"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useState, useCallback } from "react";

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      setIsUploading(true);
      setUploadError("");
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        editor
          .chain()
          .focus()
          .setImage({ src: data.url })
          .run();
      } catch {
        setUploadError("Failed to upload image. Try again.");
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return <div className="p-4 border border-default rounded-lg">Loading...</div>;
  }

  return (
    <div className="border border-default rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-paper dark:bg-[#1f1f1f] border-b border-default p-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("bold")
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("italic")
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>

        <div className="border-l border-default mx-2" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("heading", { level: 3 })
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="border-l border-default mx-2" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("bulletList")
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("orderedList")
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Ordered List"
        >
          1. List
        </button>

        <div className="border-l border-default mx-2" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("blockquote")
              ? "bg-primary text-paper border-primary"
              : "border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          }`}
          title="Blockquote"
        >
          "
        </button>

        <div className="border-l border-default mx-2" />

        <button
          type="button"
          onClick={handleImageUpload}
          disabled={isUploading}
          className="px-3 py-1 rounded border border-default hover:bg-white dark:hover:bg-[#2a2a2a]"
          title="Insert Image"
        >
          {isUploading ? "Uploading..." : "🖼 Image"}
        </button>
      </div>

      {uploadError && (
        <div className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          {uploadError}
        </div>
      )}

      {/* Editor */}
      <div className="p-4 prose-ml prose prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

import { UserRound } from "lucide-react";

/** Muted author line for home cards; unattributed pieces fall back to the journal. */
export default function CardAuthor({ author }: { author?: string | null }) {
  return (
    <p
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium"
      style={{ color: "color-mix(in srgb, var(--text-muted) 78%, transparent)" }}
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--border-subtle)" }}
      >
        <UserRound size={11} strokeWidth={2} />
      </span>
      <span className="truncate">{author?.trim() || "ബോധനം"}</span>
    </p>
  );
}

// Fallback shown wherever an article/issue has no cover image.
export const DEFAULT_IMAGE = "/images/default-image.webp";

// Fixed-proportion image frame so source images never blow up the layout.
export default function Media({
  src,
  alt,
  ratio = "16 / 10",
  className = "",
}: {
  src: string | null;
  alt: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--border-subtle)] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={src || DEFAULT_IMAGE}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );
}

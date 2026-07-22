export default function StatusBadge({ published }: { published: boolean | null }) {
  return published === false ? (
    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
      Draft
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
      Published
    </span>
  );
}

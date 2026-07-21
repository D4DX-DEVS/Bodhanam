import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { iconForTopic } from "@/lib/topicIcon";
import type { getColumns } from "@/lib/data";

type Column = Awaited<ReturnType<typeof getColumns>>[number];

export default function TopicGrid({ topics }: { topics: Column[] }) {
  if (topics.length === 0) return null;

  return (
    <section className="border-t py-10 md:py-14" style={{ borderColor: "var(--border)" }}>
      <h2 className="mb-8 font-serif-ml text-2xl font-bold text-ink md:text-3xl">
        Browse by Topic
      </h2>
      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => {
          const Icon = iconForTopic(topic.name);
          return (
            <Link
              key={topic.id}
              href={`/topics/${encodeURIComponent(topic.name)}`}
              className="group flex flex-[1_1_calc(50%-0.375rem)] flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-colors duration-200 hover:bg-primary/5 sm:flex-[1_1_140px]"
              style={{ borderColor: "var(--border)" }}
            >
              <Icon
                size={22}
                strokeWidth={1.5}
                className="text-muted transition-colors duration-200 group-hover:text-primary"
              />
              <span className="font-sans-ml text-sm text-ink">{topic.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/topics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-light"
        >
          View all topics
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}

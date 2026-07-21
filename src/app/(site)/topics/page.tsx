import { getColumns } from "@/lib/data";
import { iconForTopic } from "@/lib/topicIcon";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse Bodhanam Quarterly articles by topic",
};

export default async function TopicsPage() {
  const topics = await getColumns();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="mb-12 md:mb-16">
          <h1 className="font-serif-ml text-4xl md:text-5xl lg:text-6xl font-bold text-ink mb-4">
            Topics
          </h1>
          <p className="text-muted font-sans-ml">
            Browse Bodhanam Quarterly articles by topic
          </p>
        </div>

        {topics.length === 0 ? (
          <p className="text-muted font-sans-ml">No topics available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {topics.map((topic) => {
              const Icon = iconForTopic(topic.name);
              return (
                <Link
                  key={topic.id}
                  href={`/topics/${encodeURIComponent(topic.name)}`}
                  className="group flex w-[calc(50%-0.5rem)] flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors duration-200 hover:bg-primary/5 sm:w-[160px]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Icon
                    size={26}
                    strokeWidth={1.5}
                    className="text-muted transition-colors duration-200 group-hover:text-primary"
                  />
                  <span className="font-sans-ml text-sm font-medium text-ink">
                    {topic.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

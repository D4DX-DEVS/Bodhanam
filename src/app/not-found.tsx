import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="font-serif-ml text-7xl md:text-8xl font-bold text-primary mb-4">
          404
        </h1>
        <h2 className="font-serif-ml text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
          Page Not Found
        </h2>
        <p className="text-muted font-sans-ml mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 md:gap-4">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-medium text-paper font-sans-ml rounded transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Back to Home
          </Link>
          <Link
            href="/archives"
            className="px-6 py-3 text-sm font-medium font-sans-ml rounded border transition-all duration-300 hover:shadow-md"
            style={{
              borderColor: "var(--primary)",
              color: "var(--primary)",
            }}
          >
            View Archives
          </Link>
        </div>
      </div>
    </div>
  );
}

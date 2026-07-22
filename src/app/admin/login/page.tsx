"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { loginAction } from "@/app/admin/actions";
import BotanicalDecoration from "@/app/_components/BotanicalDecoration";

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function LoginPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginAction(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div
      className="relative flex-1 flex items-center justify-center px-4 py-12 overflow-hidden"
      style={{
        // ponytail: red admin-login theme scoped via CSS var override, doesn't touch the public site's teal theme
        "--primary": "#dc2626",
        "--primary-light": "#ef4444",
        "--primary-strong": "#b91c1c",
      } as React.CSSProperties}
    >
      {/* Faint editorial grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <BotanicalDecoration
        className="absolute -top-8 -left-12 w-44 h-52 md:w-60 md:h-72 opacity-50"
      />
      <BotanicalDecoration
        flip
        className="absolute -bottom-8 -right-12 w-44 h-52 md:w-60 md:h-72 opacity-50"
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-9 fade-up">
          <div className="text-[11px] tracking-[0.3em] uppercase text-muted mb-3">
            Editorial Access
          </div>
          <Image
            src={mounted && isDark ? "/images/logo-light.png" : "/images/logo1.png"}
            alt="Bodhanam"
            height={56}
            width={227}
            priority
            className="h-14 w-auto mx-auto"
          />
          <div className="mt-4 flex items-center justify-center gap-3">
            <span
              className="h-px w-8"
              style={{ backgroundColor: "var(--border)" }}
            />
            <span className="text-xs tracking-[0.35em] uppercase text-muted">
              Admin Panel
            </span>
            <span
              className="h-px w-8"
              style={{ backgroundColor: "var(--border)" }}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="fade-up relative space-y-5 bg-white dark:bg-[#201d19] rounded-2xl p-8 sm:p-9 border border-default shadow-[0_20px_60px_-15px_rgba(13,12,10,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: "120ms" }}
        >
          <span
            aria-hidden="true"
            className="absolute top-0 left-9 right-9 h-[3px] rounded-full"
            style={{ backgroundColor: "var(--primary)", opacity: 0.7 }}
          />

          {error && (
            <div className="fade-up flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-muted mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper placeholder:text-muted"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-muted mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper placeholder:text-muted"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-ink transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 px-4 py-3 btn-primary rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center fade-up" style={{ animationDelay: "220ms" }}>
          <a
            href="/"
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  );
}

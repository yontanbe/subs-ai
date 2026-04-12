"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/editor");
      router.refresh();
    }
  };

  return (
    <div className="hero-gradient flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            Welcome back
          </h1>
          <p className="mt-2 text-[13px] text-white/35">
            Sign in to your ReelMix account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="animate-fade-in rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-glass w-full rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-glass w-full rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-white/30">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#e09145] transition hover:text-[#f0b678]"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

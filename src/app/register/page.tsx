"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/editor");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            Create account
          </h1>
          <p className="mt-2 text-[13px] text-white/35">
            Start subtitling videos for free
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-glass w-full rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/20"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-glass w-full rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {loading && <span className="spinner" />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-white/30">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#e09145] transition hover:text-[#f0b678]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

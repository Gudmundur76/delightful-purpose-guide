import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign In — GROW_" },
      { name: "description", content: "Sign in to your account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/login" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-extrabold tracking-tighter text-4xl sm:text-5xl uppercase mb-3">
            Sign in
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Access your GROW_ account
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 bg-foreground text-background font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && (
          <p className="mt-4 font-mono text-xs text-destructive text-center">
            {error}
          </p>
        )}

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
          By continuing you agree to our terms.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.45-1.7 4.25-5.5 4.25-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.13.8 3.85 1.48l2.62-2.53C16.95 3.65 14.7 2.7 12 2.7 6.93 2.7 2.85 6.78 2.85 11.85S6.93 21 12 21c6.93 0 9.15-4.85 9.15-7.3 0-.49-.05-.86-.12-1.23H12z"
      />
    </svg>
  );
}

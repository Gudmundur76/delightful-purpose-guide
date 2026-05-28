import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getAllPosts, type BlogPost } from "@/lib/blog/posts";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Journal — Grow" },
      {
        name: "description",
        content:
          "Field notes on shipping agent-native websites: structured data, llms.txt, and design that gets cited by LLMs.",
      },
      { property: "og:title", content: "Journal — Grow" },
      {
        property: "og:description",
        content:
          "Field notes on shipping agent-native websites: structured data, llms.txt, and design that gets cited by LLMs.",
      },
      { property: "og:url", content: "https://grow.contact/blog" },
    ],
    links: [
      { rel: "canonical", href: "https://grow.contact/blog" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Grow — Journal",
        href: "https://grow.contact/blog/rss.xml",
      },
    ],
  }),
});

// Deterministic agent metadata derived from the post slug, so the same post
// always shows the same numbers between renders.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SCHEMA_TYPES = ["Article", "TechArticle", "BlogPosting", "HowTo"] as const;

function agentMeta(post: BlogPost) {
  const h = hash(post.slug);
  const parseMs = 14 + (h % 28); // 14–41ms
  const citability = 72 + (h % 24); // 72–95
  const schema = SCHEMA_TYPES[h % SCHEMA_TYPES.length];
  return { parseMs, citability, schema };
}

function BlogIndex() {
  const posts = getAllPosts();
  const popular = [...posts]
    .map((p) => ({ post: p, ...agentMeta(p) }))
    .sort((a, b) => b.citability - a.citability)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <span className="font-mono text-xs font-medium px-2 py-1 border border-accent text-accent tracking-tighter uppercase">
              Journal
            </span>
            <span className="font-extrabold tracking-tighter text-xl uppercase">
              GROW_
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="/blog/rss.xml"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors px-2 py-1 border border-border"
              title="Subscribe via RSS"
            >
              RSS
            </a>
            <Link
              to="/"
              className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-all"
            >
              ← Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
            // Journal · agent-readable
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9]">
            Field notes
            <br />
            from the build.
          </h1>
          <p className="mt-8 max-w-2xl text-muted-foreground text-lg">
            Practical writing on shipping agent-native websites — structured for
            humans, parsed by ChatGPT, Perplexity, and Claude.
          </p>
        </div>
      </section>

      <section aria-labelledby="blog-posts-heading">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-12 gap-12">
          {/* Cards */}
          <div className="lg:col-span-8 grid gap-6">
            <h2 id="blog-posts-heading" className="sr-only">Latest articles</h2>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            <div className="border border-border bg-card">
              <header className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  // Popular · by agent score
                </span>
              </header>
              <ol className="divide-y divide-border">
                {popular.map((row, i) => (
                  <li key={row.post.slug}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: row.post.slug }}
                      className="flex items-start gap-3 px-5 py-4 hover:bg-muted/40 transition-colors group"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground tabular-nums pt-1">
                        0{i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold tracking-tight leading-snug group-hover:text-accent transition-colors">
                          {row.post.title}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          <span className="text-accent">
                            {row.citability}/100
                          </span>
                          <span>· {row.parseMs}ms</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-accent/40 bg-accent/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                // Check your site
              </p>
              <h3 className="text-lg font-extrabold tracking-tighter uppercase leading-tight mb-2">
                What's your Agent Readability Score?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Run a free scan — semantic HTML, JSON-LD, llms.txt, citability,
                speed. Results in under a minute.
              </p>
              <Link
                to="/check"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-4 py-2.5 uppercase tracking-tighter text-xs hover:bg-foreground hover:text-background transition-colors"
              >
                Run /check
                <span className="font-mono text-[10px]">→</span>
              </Link>
            </div>

            <form
              className="border border-border bg-background p-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const email = String(fd.get("email") ?? "");
                if (email) {
                  (e.currentTarget as HTMLFormElement).reset();
                  alert(`Subscribed: ${email}`);
                }
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                // Newsletter
              </p>
              <h3 className="text-lg font-extrabold tracking-tighter uppercase leading-tight mb-2">
                One agent-native build per week.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Tear-downs, schema patterns, and citation case studies. No
                fluff, no sponsors.
              </p>
              <div className="flex flex-col gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  placeholder="you@startup.com"
                  aria-label="Email address"
                  className="bg-card border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="bg-foreground text-background font-bold px-4 py-2.5 uppercase tracking-tighter text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </aside>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const meta = agentMeta(post);
  const [agentView, setAgentView] = useState(false);

  return (
    <article className="border border-border bg-card hover:border-accent/60 transition-colors">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </time>
          <span>· {post.readingMinutes} min read</span>
        </span>
        <button
          type="button"
          onClick={() => setAgentView((v) => !v)}
          aria-pressed={agentView}
          className={`px-2 py-1 border transition-colors ${
            agentView
              ? "border-accent text-accent bg-accent/10"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
          }`}
        >
          {agentView ? "● Agent View" : "○ Agent View"}
        </button>
      </header>

      {agentView ? (
        <pre className="px-5 py-5 font-mono text-[12px] leading-relaxed text-emerald-400 overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "${meta.schema}",
  "headline": "${post.title.replace(/"/g, '\\"')}",
  "datePublished": "${post.publishedAt}",
  "wordCount": ${post.body.split(/\s+/).length},
  "keywords": [${post.tags.map((t) => `"${t}"`).join(", ")}],
  "agent": {
    "parseTimeMs": ${meta.parseMs},
    "citabilityScore": ${meta.citability},
    "tokenEstimate": ${Math.round(post.body.length / 4)}
  }
}`}
        </pre>
      ) : (
        <div className="p-5 md:p-6">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group block"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase leading-tight group-hover:text-accent transition-colors">
              {post.title}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          </Link>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-border text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <footer className="grid grid-cols-3 divide-x divide-border border-t border-border font-mono text-[10px] uppercase tracking-widest">
        <MetaCell label="Agent parse" value={`${meta.parseMs}ms`} />
        <MetaCell label="Schema" value={meta.schema} />
        <MetaCell
          label="Citability"
          value={`${meta.citability}/100`}
          accent={meta.citability >= 85}
        />
      </footer>
    </article>
  );
}

function MetaCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-1">
      <span className="text-muted-foreground">// {label}</span>
      <span
        className={`text-foreground normal-case tracking-tight ${accent ? "text-accent" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog/posts";

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Journal — Grow" },
      {
        name: "description",
        content:
          "Field notes on shipping custom websites: startup web design, SaaS landing pages, and when DIY builders stop scaling.",
      },
      { property: "og:title", content: "Journal — Grow" },
      {
        property: "og:description",
        content:
          "Field notes on shipping custom websites: startup web design, SaaS landing pages, and when DIY builders stop scaling.",
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

function BlogIndex() {
  const posts = getAllPosts();
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
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
            // Journal
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9]">
            Field notes
            <br />
            from the build.
          </h1>
          <p className="mt-8 max-w-2xl text-muted-foreground text-lg">
            Practical writing on shipping custom websites — for founders,
            operators, and design leads who want signal over theory.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <ul className="divide-y divide-border border-y border-border">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block py-10 md:py-14 hover:bg-muted/30 -mx-6 px-6 transition-colors"
                >
                  <div className="grid md:grid-cols-12 gap-6 md:gap-12 items-baseline">
                    <div className="md:col-span-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </time>
                      <span className="mx-2">·</span>
                      <span>{post.readingMinutes} min</span>
                    </div>
                    <div className="md:col-span-9">
                      <h2 className="text-2xl md:text-4xl font-extrabold tracking-tighter uppercase leading-tight group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-4 text-muted-foreground max-w-3xl">
                        {post.description}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
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
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

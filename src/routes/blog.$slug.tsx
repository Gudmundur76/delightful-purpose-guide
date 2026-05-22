import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPost, getAllPosts } from "@/lib/blog/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.2em] mb-4">
          // 404
        </p>
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">
          Post not found
        </h1>
        <Link
          to="/blog"
          className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter"
        >
          ← Journal
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
          Something broke
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{error.message}</p>
        <Link
          to="/blog"
          className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter"
        >
          ← Journal
        </Link>
      </div>
    </div>
  ),
  component: PostPage,
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return { meta: [{ title: "Post not found — Grow" }] };
    }
    const { post } = loaderData;
    const url = `https://grow.contact/blog/${post.slug}`;
    return {
      meta: [
        { title: post.title.length > 55 ? post.title : `${post.title} — Grow` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://grow.contact/og-home.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://grow.contact/og-home.png" },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:author", content: "Grow Editorial" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            image: ["https://grow.contact/og-home.png"],
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: { "@type": "Organization", name: "Grow Editorial", url: "https://grow.contact/" },
            publisher: {
              "@type": "Organization",
              name: "Grow",
              url: "https://grow.contact/",
              logo: {
                "@type": "ImageObject",
                url: "https://grow.contact/og-home.png",
              },
            },
            mainEntityOfPage: url,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://grow.contact/" },
              { "@type": "ListItem", position: 2, name: "Journal", item: "https://grow.contact/blog" },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
      ],
    };
  },
});

function renderBody(body: string) {
  const blocks = body.split(/\n\s*\n/);
  return blocks.map((raw, i) => {
    const block = raw.trim();
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mt-14 mb-6"
        >
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").map((l) => l.replace(/^-\s+/, ""));
      return (
        <ul
          key={i}
          className="my-6 space-y-3 list-none pl-0 border-l-2 border-accent"
        >
          {items.map((item, j) => (
            <li
              key={j}
              className="pl-6 text-lg leading-relaxed text-foreground/90"
            >
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p
        key={i}
        className="my-5 text-lg leading-relaxed text-foreground/90"
      >
        {block}
      </p>
    );
  });
}

function PostPage() {
  const { post } = Route.useLoaderData();
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

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
          <Link
            to="/blog"
            className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-all"
          >
            All Posts
          </Link>
        </div>
      </nav>

      <article>
        <header className="border-b border-border">
          <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
            <Link
              to="/blog"
              className="font-mono text-accent text-xs uppercase tracking-[0.2em] hover:underline"
            >
              ← Journal
            </Link>
            <h1 className="mt-8 text-4xl md:text-6xl font-extrabold tracking-tighter uppercase leading-[0.95]">
              {post.title}
            </h1>
            <div className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="mx-2">·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
          {renderBody(post.body)}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs uppercase tracking-[0.2em] mb-8">
              // Keep reading
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block border border-border p-8 hover:border-accent transition-colors bg-background"
                >
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {p.readingMinutes} min
                  </p>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tighter uppercase leading-tight group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

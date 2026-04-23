import Link from "next/link";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string };
}) {
  const [posts, categories, tags] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
    getAllTags(),
  ]);

  const filteredPosts = posts.filter((post) => {
    if (searchParams.category && post.category?.slug !== searchParams.category) {
      return false;
    }
    if (searchParams.tag && !post.tags.some((t) => t.slug === searchParams.tag)) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                !searchParams.category
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              aria-label="Show all categories"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  searchParams.category === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                aria-label={`Filter by ${cat.name}`}
              >
                {cat.name} ({cat.post_count})
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={searchParams.category ? `/?category=${searchParams.category}` : "/"}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                !searchParams.tag
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              aria-label="Show all tags"
            >
              All
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  searchParams.tag === tag.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                aria-label={`Filter by tag ${tag.name}`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Post list */}
      {filteredPosts.length === 0 ? (
        <p className="text-muted-foreground">No posts found.</p>
      ) : (
        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <article key={post.slug} className="border-b pb-8">
              <Link href={`/blog/${post.slug}`} className="group">
                {post.cover_image_url && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  {post.category && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.category.name}</span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-semibold mt-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                )}
              </Link>
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

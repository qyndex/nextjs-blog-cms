import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <Link href={`/blog/${post.slug}`} className="group">
              <p className="text-sm text-muted-foreground">
                {post.date} &middot; {post.category}
              </p>
              <h2 className="text-2xl font-semibold mt-1 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

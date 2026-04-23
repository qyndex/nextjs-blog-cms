import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostComments } from "@/lib/posts";
import { CommentSection } from "@/components/CommentSection";

interface Props {
  params: { slug: string };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const comments = await getPostComments(post.id);

  return (
    <article>
      <header className="mb-8">
        {post.cover_image_url && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-64 w-full object-cover"
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
              <Link
                href={`/?category=${post.category.slug}`}
                className="hover:text-primary"
                aria-label={`View posts in ${post.category.name}`}
              >
                {post.category.name}
              </Link>
            </>
          )}
          {post.author && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>by {post.author.full_name || post.author.username}</span>
            </>
          )}
        </div>
        <h1 className="text-4xl font-bold mt-2">{post.title}</h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground mt-4">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}`}
                className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80"
                aria-label={`View posts tagged ${tag.name}`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">
        {post.content}
      </div>

      <hr className="my-12" />

      <CommentSection postId={post.id} initialComments={comments} />
    </article>
  );
}

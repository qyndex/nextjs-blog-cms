import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <header className="not-prose mb-8">
        <p className="text-sm text-muted-foreground">
          {post.date} &middot; {post.category}
        </p>
        <h1 className="text-4xl font-bold mt-2">{post.title}</h1>
        <p className="text-lg text-muted-foreground mt-4">{post.excerpt}</p>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

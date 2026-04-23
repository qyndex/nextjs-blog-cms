"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { PostWithRelations, Tag } from "@/types/database";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function AdminPostsPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchPosts() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*, category:categories(*), author:profiles(*)")
        .eq("author_id", user!.id)
        .order("updated_at", { ascending: false });

      if (fetchError) {
        setError("Failed to load posts.");
        setLoading(false);
        return;
      }

      // Fetch tags
      const postIds = (data || []).map((p: PostWithRelations) => p.id);
      let tagsByPost: Record<string, Tag[]> = {};

      if (postIds.length > 0) {
        const { data: postTags } = await supabase
          .from("post_tags")
          .select("post_id, tag:tags(*)")
          .in("post_id", postIds);

        if (postTags) {
          for (const pt of postTags) {
            const pid = pt.post_id as string;
            if (!tagsByPost[pid]) tagsByPost[pid] = [];
            const tag = pt.tag;
            if (tag && typeof tag === "object" && "id" in tag) {
              tagsByPost[pid].push(tag as unknown as Tag);
            }
          }
        }
      }

      const enriched = (data || []).map((p: PostWithRelations) => ({
        ...p,
        tags: tagsByPost[p.id] || [],
      }));

      setPosts(enriched);
      setLoading(false);
    }

    fetchPosts();
  }, [user, authLoading]);

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      setError("Failed to delete post.");
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  if (authLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!user) {
    return <p className="text-muted-foreground">Please sign in to access the dashboard.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          aria-label="Create new post"
        >
          New Post
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts yet.</p>
          <Link
            href="/admin/posts/new"
            className="text-primary hover:underline"
            aria-label="Write your first post"
          >
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold truncate">{post.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[post.status]}`}
                  >
                    {post.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {post.category && <span>{post.category.name}</span>}
                  <span>
                    Updated {new Date(post.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
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
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                  aria-label={`Edit ${post.title}`}
                >
                  Edit
                </Link>
                {post.status === "published" && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                    aria-label={`View ${post.title}`}
                  >
                    View
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="rounded-md border border-destructive/50 px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${post.title}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

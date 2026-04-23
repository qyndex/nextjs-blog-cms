"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PostEditor } from "@/components/PostEditor";
import type { PostWithRelations, Tag } from "@/types/database";

interface Props {
  params: { slug: string };
}

export default function EditPostPage({ params }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<PostWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchPost() {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*, category:categories(*), author:profiles(*)")
        .eq("slug", params.slug)
        .single();

      if (fetchError || !data) {
        setError("Post not found.");
        setLoading(false);
        return;
      }

      // Check ownership
      if (data.author_id !== user!.id) {
        setError("You do not have permission to edit this post.");
        setLoading(false);
        return;
      }

      // Fetch tags
      const { data: postTags } = await supabase
        .from("post_tags")
        .select("tag:tags(*)")
        .eq("post_id", data.id);

      const tags: Tag[] = postTags
        ? postTags
            .map((pt: Record<string, unknown>) => pt.tag as Tag)
            .filter(Boolean)
        : [];

      setPost({ ...data, tags } as PostWithRelations);
      setLoading(false);
    }

    fetchPost();
  }, [params.slug, user, authLoading]);

  if (authLoading || loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive" role="alert">
        {error}
      </div>
    );
  }

  if (!user) {
    return <p className="text-muted-foreground">Please sign in to edit posts.</p>;
  }

  if (!post) {
    return <p className="text-muted-foreground">Post not found.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <PostEditor existingPost={post} />
    </div>
  );
}

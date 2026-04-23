import { createServerClient } from "./supabase";
import type { Post, PostWithRelations, Tag, Comment, CommentWithAuthor } from "@/types/database";

/**
 * Fetch all posts by a specific author (including drafts).
 */
export async function getAuthorPosts(authorId: string): Promise<PostWithRelations[]> {
  const db = createServerClient();

  const { data: posts, error } = await db
    .from("posts")
    .select("*, category:categories(*), author:profiles(*)")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  if (error || !posts) return [];

  // Fetch tags for all posts
  const postIds = posts.map((p: Post) => p.id);
  const { data: postTags } = await db
    .from("post_tags")
    .select("post_id, tag:tags(*)")
    .in("post_id", postIds);

  const tagsByPost: Record<string, Tag[]> = {};
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

  return posts.map((p) => ({
    ...(p as unknown as Post),
    category: (p as Record<string, unknown>).category as PostWithRelations["category"],
    author: (p as Record<string, unknown>).author as PostWithRelations["author"],
    tags: tagsByPost[(p as Record<string, unknown>).id as string] || [],
  }));
}

/**
 * Fetch a single post by slug for editing (author must match).
 */
export async function getPostForEdit(slug: string): Promise<PostWithRelations | null> {
  const db = createServerClient();

  const { data: post, error } = await db
    .from("posts")
    .select("*, category:categories(*), author:profiles(*)")
    .eq("slug", slug)
    .single();

  if (error || !post) return null;

  const { data: postTags } = await db
    .from("post_tags")
    .select("tag:tags(*)")
    .eq("post_id", post.id);

  const tags: Tag[] = postTags
    ? postTags.map((pt: Record<string, unknown>) => pt.tag as Tag).filter(Boolean)
    : [];

  return { ...post, tags } as PostWithRelations;
}

/**
 * Fetch all comments for posts authored by a specific user (for moderation).
 */
export async function getCommentsForModeration(authorId: string): Promise<(CommentWithAuthor & { post_title: string })[]> {
  const db = createServerClient();

  // Get all posts by this author
  const { data: posts } = await db
    .from("posts")
    .select("id, title")
    .eq("author_id", authorId);

  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p: { id: string }) => p.id);
  const postTitles: Record<string, string> = {};
  for (const p of posts) {
    postTitles[p.id] = p.title;
  }

  const { data: comments, error } = await db
    .from("comments")
    .select("*, author:profiles(*)")
    .in("post_id", postIds)
    .order("created_at", { ascending: false });

  if (error || !comments) return [];

  return comments.map((c: CommentWithAuthor) => ({
    ...c,
    post_title: postTitles[c.post_id] || "Unknown Post",
  }));
}

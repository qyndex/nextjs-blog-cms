import { createServerClient } from "./supabase";
import type { Post, PostWithRelations, Category, Tag, Comment, CommentWithAuthor } from "@/types/database";

/**
 * Fetch all published posts with category and tag relations.
 * Ordered by published_at descending.
 */
export async function getAllPosts(): Promise<PostWithRelations[]> {
  const db = createServerClient();

  const { data: posts, error } = await db
    .from("posts")
    .select("*, category:categories(*), author:profiles(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

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
 * Fetch a single published post by slug, including tags and comments.
 */
export async function getPostBySlug(slug: string): Promise<PostWithRelations | null> {
  const db = createServerClient();

  const { data: post, error } = await db
    .from("posts")
    .select("*, category:categories(*), author:profiles(*)")
    .eq("slug", slug)
    .eq("status", "published")
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
 * Fetch approved comments for a post, with author info.
 */
export async function getPostComments(postId: string): Promise<CommentWithAuthor[]> {
  const db = createServerClient();

  const { data, error } = await db
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("post_id", postId)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as CommentWithAuthor[];
}

/**
 * Fetch all categories with post counts.
 */
export async function getAllCategories(): Promise<(Category & { post_count: number })[]> {
  const db = createServerClient();

  const { data: categories, error } = await db
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error || !categories) return [];

  // Get post counts per category (only published)
  const { data: posts } = await db
    .from("posts")
    .select("category_id")
    .eq("status", "published");

  const counts: Record<string, number> = {};
  if (posts) {
    for (const p of posts) {
      const cid = p.category_id as string;
      if (cid) counts[cid] = (counts[cid] || 0) + 1;
    }
  }

  return categories.map((c: Category) => ({
    ...c,
    post_count: counts[c.id] || 0,
  }));
}

/**
 * Fetch all tags.
 */
export async function getAllTags(): Promise<Tag[]> {
  const db = createServerClient();

  const { data, error } = await db
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as Tag[];
}

/**
 * Fetch published posts by category slug.
 */
export async function getPostsByCategory(categorySlug: string): Promise<PostWithRelations[]> {
  const db = createServerClient();

  // First get the category
  const { data: category } = await db
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  const { data: posts, error } = await db
    .from("posts")
    .select("*, category:categories(*), author:profiles(*)")
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !posts) return [];

  return posts.map((p) => ({
    ...(p as unknown as Post),
    category: (p as Record<string, unknown>).category as PostWithRelations["category"],
    author: (p as Record<string, unknown>).author as PostWithRelations["author"],
    tags: [] as Tag[],
  }));
}

/**
 * Fetch published posts by tag slug.
 */
export async function getPostsByTag(tagSlug: string): Promise<PostWithRelations[]> {
  const db = createServerClient();

  // Get the tag
  const { data: tag } = await db
    .from("tags")
    .select("id")
    .eq("slug", tagSlug)
    .single();

  if (!tag) return [];

  // Get post IDs with this tag
  const { data: postTags } = await db
    .from("post_tags")
    .select("post_id")
    .eq("tag_id", tag.id);

  if (!postTags || postTags.length === 0) return [];

  const postIds = postTags.map((pt: { post_id: string }) => pt.post_id);

  const { data: posts, error } = await db
    .from("posts")
    .select("*, category:categories(*), author:profiles(*)")
    .in("id", postIds)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !posts) return [];

  return posts.map((p) => ({
    ...(p as unknown as Post),
    category: (p as Record<string, unknown>).category as PostWithRelations["category"],
    author: (p as Record<string, unknown>).author as PostWithRelations["author"],
    tags: [] as Tag[],
  }));
}

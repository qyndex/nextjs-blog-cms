"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { Category, Tag, PostWithRelations } from "@/types/database";

interface PostEditorProps {
  /** If provided, we are editing an existing post */
  existingPost?: PostWithRelations | null;
}

export function PostEditor({ existingPost }: PostEditorProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState(existingPost?.title || "");
  const [slug, setSlug] = useState(existingPost?.slug || "");
  const [content, setContent] = useState(existingPost?.content || "");
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || "");
  const [coverImageUrl, setCoverImageUrl] = useState(existingPost?.cover_image_url || "");
  const [categoryId, setCategoryId] = useState(existingPost?.category_id || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    existingPost?.tags.map((t) => t.id) || []
  );
  const [publishNow, setPublishNow] = useState(existingPost?.status === "published");

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeta() {
      const [catRes, tagRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
      ]);
      if (catRes.data) setCategories(catRes.data as Category[]);
      if (tagRes.data) setTags(tagRes.data as Tag[]);
    }
    fetchMeta();
  }, []);

  // Auto-generate slug from title when creating new post
  useEffect(() => {
    if (!existingPost && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [title, existingPost]);

  function handleTagToggle(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      cover_image_url: coverImageUrl || null,
      category_id: categoryId || null,
      author_id: user.id,
      status: publishNow ? "published" : "draft",
      published_at: publishNow ? new Date().toISOString() : null,
    };

    let postId: string;

    if (existingPost) {
      // Update existing post
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          ...postData,
          // Preserve original published_at if already published and staying published
          published_at:
            publishNow && existingPost.published_at
              ? existingPost.published_at
              : publishNow
              ? new Date().toISOString()
              : null,
        })
        .eq("id", existingPost.id);

      if (updateError) {
        setError(`Failed to update post: ${updateError.message}`);
        setSaving(false);
        return;
      }
      postId = existingPost.id;
    } else {
      // Create new post
      const { data, error: insertError } = await supabase
        .from("posts")
        .insert(postData)
        .select("id")
        .single();

      if (insertError || !data) {
        setError(`Failed to create post: ${insertError?.message || "Unknown error"}`);
        setSaving(false);
        return;
      }
      postId = data.id;
    }

    // Update tags: delete existing, insert new
    await supabase.from("post_tags").delete().eq("post_id", postId);

    if (selectedTagIds.length > 0) {
      const tagRows = selectedTagIds.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
      }));
      await supabase.from("post_tags").insert(tagRows);
    }

    setSaving(false);
    router.push("/admin/posts");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Post title"
          aria-label="Post title"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="url-friendly-slug"
          aria-label="Post slug"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Brief description for listing pages"
          aria-label="Post excerpt"
        />
      </div>

      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium mb-1">
          Cover Image URL
        </label>
        <input
          id="coverImageUrl"
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://images.unsplash.com/..."
          aria-label="Cover image URL"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Post category"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              aria-label={`${selectedTagIds.includes(tag.id) ? "Remove" : "Add"} tag ${tag.name}`}
              aria-pressed={selectedTagIds.includes(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Content
        </label>
        <textarea
          id="content"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="Write your post content here... (Markdown supported)"
          aria-label="Post content"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="publishNow"
          type="checkbox"
          checked={publishNow}
          onChange={(e) => setPublishNow(e.target.checked)}
          className="rounded border focus:ring-2 focus:ring-primary"
          aria-label="Publish immediately"
        />
        <label htmlFor="publishNow" className="text-sm font-medium">
          {existingPost?.status === "published"
            ? "Keep published"
            : "Publish immediately"}
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          aria-label={existingPost ? "Save changes" : "Create post"}
        >
          {saving
            ? "Saving..."
            : existingPost
            ? "Save Changes"
            : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
          aria-label="Cancel editing"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

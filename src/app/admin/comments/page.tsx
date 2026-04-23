"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { CommentWithAuthor } from "@/types/database";

interface ModerationComment extends CommentWithAuthor {
  post_title: string;
}

export default function AdminCommentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchComments() {
      setLoading(true);

      // Get all posts by this author
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title")
        .eq("author_id", user!.id);

      if (!posts || posts.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      const postIds = posts.map((p: { id: string }) => p.id);
      const postTitles: Record<string, string> = {};
      for (const p of posts) {
        postTitles[p.id] = p.title;
      }

      const { data, error: fetchError } = await supabase
        .from("comments")
        .select("*, author:profiles(*)")
        .in("post_id", postIds)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Failed to load comments.");
        setLoading(false);
        return;
      }

      const enriched = (data || []).map((c: CommentWithAuthor) => ({
        ...c,
        post_title: postTitles[c.post_id] || "Unknown Post",
      }));

      setComments(enriched);
      setLoading(false);
    }

    fetchComments();
  }, [user, authLoading]);

  async function handleApprove(commentId: string) {
    const { error: updateError } = await supabase
      .from("comments")
      .update({ approved: true })
      .eq("id", commentId);

    if (updateError) {
      setError("Failed to approve comment.");
      return;
    }

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, approved: true } : c))
    );
  }

  async function handleReject(commentId: string) {
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      setError("Failed to delete comment.");
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  const filteredComments = comments.filter((c) => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  if (authLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!user) {
    return <p className="text-muted-foreground">Please sign in to moderate comments.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Comment Moderation</h1>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            aria-label={`Show ${f} comments`}
            aria-pressed={filter === f}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && (
              <span className="ml-1 text-xs">
                ({comments.filter((c) => !c.approved).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading comments...</p>
      ) : filteredComments.length === 0 ? (
        <p className="text-muted-foreground">No comments to display.</p>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg border p-4 ${
                !comment.approved ? "border-yellow-300 dark:border-yellow-700" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.author?.full_name || comment.author?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        comment.approved
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {comment.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    On: <span className="font-medium">{comment.post_title}</span>
                  </p>
                  <p className="text-sm">{comment.content}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!comment.approved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="rounded-md border border-green-500 px-3 py-1 text-sm text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                      aria-label={`Approve comment by ${comment.author?.full_name || "anonymous"}`}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(comment.id)}
                    className="rounded-md border border-destructive/50 px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
                    aria-label={`Delete comment by ${comment.author?.full_name || "anonymous"}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

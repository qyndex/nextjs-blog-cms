"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { CommentWithAuthor } from "@/types/database";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const { data, error: submitError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
      })
      .select("*, author:profiles(*)")
      .single();

    if (submitError) {
      setError("Failed to submit comment. Please try again.");
      setSubmitting(false);
      return;
    }

    // If comment is auto-approved, show it. Otherwise show a success message.
    if (data && data.approved) {
      setComments((prev) => [...prev, data as CommentWithAuthor]);
    } else {
      setSuccess(true);
    }

    setContent("");
    setSubmitting(false);
  }

  return (
    <section aria-label="Comments">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="text-muted-foreground mb-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {comment.author?.full_name || comment.author?.username || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold">Leave a Comment</h3>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-primary/50 bg-primary/10 p-3 text-sm text-primary" role="status">
              Your comment has been submitted and is awaiting moderation.
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            aria-label="Comment text"
          />

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            aria-label="Submit comment"
          >
            {submitting ? "Submitting..." : "Submit Comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <a href="/auth/login" className="text-primary hover:underline">
            Sign in
          </a>{" "}
          to leave a comment.
        </p>
      )}
    </section>
  );
}

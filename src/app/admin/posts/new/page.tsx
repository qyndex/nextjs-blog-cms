"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { PostEditor } from "@/components/PostEditor";

export default function NewPostPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!user) {
    return <p className="text-muted-foreground">Please sign in to create posts.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Post</h1>
      <PostEditor />
    </div>
  );
}

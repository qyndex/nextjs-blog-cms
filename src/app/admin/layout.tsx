import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8">
      <aside className="w-48 shrink-0">
        <nav className="sticky top-24 space-y-1" aria-label="Admin navigation">
          <Link
            href="/admin/posts"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            My Posts
          </Link>
          <Link
            href="/admin/posts/new"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            New Post
          </Link>
          <Link
            href="/admin/comments"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Comments
          </Link>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

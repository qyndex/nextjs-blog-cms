import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Blog
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Posts
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-primary">
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}

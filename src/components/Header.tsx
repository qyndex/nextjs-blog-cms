"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
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
          {user ? (
            <>
              <Link href="/admin/posts" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium hover:text-primary"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium hover:text-primary">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

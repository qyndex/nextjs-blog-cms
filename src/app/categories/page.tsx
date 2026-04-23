import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default async function CategoriesPage() {
  const posts = await getAllPosts();
  const categories = [...new Set(posts.map((p) => p.category))];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Categories</h1>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => {
          const count = posts.filter((p) => p.category === cat).length;
          return (
            <Link
              key={cat}
              href={`/categories/${cat.toLowerCase()}`}
              className="rounded-xl border p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-lg">{cat}</h2>
              <p className="text-sm text-muted-foreground">{count} posts</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { getAllCategories } from "@/lib/posts";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Categories</h1>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">No categories found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="rounded-xl border p-6 hover:shadow-md transition-shadow"
              aria-label={`View posts in ${cat.name}`}
            >
              <h2 className="font-semibold text-lg">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {cat.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {cat.post_count} {cat.post_count === 1 ? "post" : "posts"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Database types matching the Supabase schema */

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  author_id: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  category: Category | null;
  author: Profile | null;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: Profile | null;
}

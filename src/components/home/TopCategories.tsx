"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVER_URL } from "@/lib/api";
import { fetchJsonWithRetry } from "@/lib/fetch-retry";
import { playfair } from "@/lib/fonts";

type Category = {
  _id: string;
  name: string;
  slug: string;
  section: string;
  image: string;
};

// If a category has no image yet, use one of these photos for its card,
// so the home page never looks empty. The admin can set a real image
// later from Admin → Categories → Edit.
const fallbackImages: Record<string, string> = {
  panjabi:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
  "t-shirt":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
  shirt:
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
  polo: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=600&auto=format&fit=crop",
  "pant-trouser":
    "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
  saree:
    "https://images.unsplash.com/photo-1610189844806-447fc9e4b57c?q=80&w=600&auto=format&fit=crop",
  "three-piece":
    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
  kurti:
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop",
};

// Load categories from the server (kept outside the component,
// so the effect below can set state inside .then()).
// fetchJsonWithRetry quietly retries on a cold first visit, so the
// categories no longer go missing just because the server was
// waking up.
async function fetchCategories(): Promise<Category[]> {
  const data = await fetchJsonWithRetry<Category[]>(
    `${SERVER_URL}/api/categories`
  );
  return Array.isArray(data) ? data : [];
}

// One grey placeholder card, shown while categories are loading.
function CategorySkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border bg-white">
      <div className="aspect-4/3 w-full bg-zinc-200" />
      <div className="mx-auto my-3 h-4 w-1/2 rounded bg-zinc-200" />
    </div>
  );
}

export default function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchCategories()
      .then((data) => {
        if (!ignore) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <h2 className={`${playfair.className} text-3xl font-bold`}>
          Top Categories
        </h2>
        <p className="mt-2 text-zinc-600">
          Shop by category — fashion for men and women
        </p>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-center text-zinc-500">
          Categories are coming soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/shop?category=${category.slug}`}
              className="group overflow-hidden rounded-lg border bg-white hover:border-[rgb(13,148,136)]"
            >
              <div className="relative aspect-4/3 w-full">
                <Image
                  src={category.image || fallbackImages[category.slug] || ""}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 rounded-full bg-[rgb(204,251,241)] px-2 py-0.5 text-xs font-semibold text-[rgb(15,118,110)] capitalize">
                  {category.section}
                </span>
              </div>
              <p
                className={`${playfair.className} px-4 py-3 text-center text-lg font-semibold`}
              >
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

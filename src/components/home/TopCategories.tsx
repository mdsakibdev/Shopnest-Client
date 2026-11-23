"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVER_URL } from "@/lib/api";
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
    "https://images.pexels.com/photos/36981453/pexels-photo-36981453.jpeg?auto=compress&cs=tinysrgb&w=600",
  "t-shirt":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
  shirt:
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
  polo: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=600&auto=format&fit=crop",
  "pant-and-trouser":
    "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
  saree:
    "https://images.pexels.com/photos/30703872/pexels-photo-30703872.jpeg?auto=compress&cs=tinysrgb&w=600",
  "three-piece":
    "https://images.pexels.com/photos/20690511/pexels-photo-20690511.jpeg?auto=compress&cs=tinysrgb&w=600",
  kurti:
    "https://images.pexels.com/photos/2558681/pexels-photo-2558681.jpeg?auto=compress&cs=tinysrgb&w=600",
};

// Load categories from the server (kept outside the component,
// so the effect below can set state inside .then()).
async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${SERVER_URL}/api/categories`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchCategories().then((data) => {
      if (!ignore) {
        setCategories(data);
        setLoading(false);
      }
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
        <p className="mt-8 text-center text-zinc-500">Loading categories...</p>
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

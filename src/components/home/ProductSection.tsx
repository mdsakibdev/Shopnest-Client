"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVER_URL } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import ProductCard, { type Product } from "@/components/ProductCard";

// Load products from the server for one section (kept outside the
// component, so the effect below can set state inside .then()).
async function fetchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${SERVER_URL}/api/products?${query}`);
  const data = await res.json();
  return data.products || [];
}

type Props = {
  title: string;
  subtitle?: string;
  tag?: string;
  query: string;
  viewAllLink: string;
  // Background colour of this section's band — each home section gets
  // its own light colour, so they are easy to tell apart while scrolling.
  bg?: string;
};

// One home-page product section (Flash Sale, Men's, Women's, New Arrivals).
// The home page decides the title and which products to ask the server for.
export default function ProductSection({
  title,
  subtitle,
  tag,
  query,
  viewAllLink,
  bg = "",
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchProducts(query).then((data) => {
      if (!ignore) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query]);

  // While loading, keep the space calm; if a section has no products,
  // hide it completely so the home page never looks broken.
  if (!loading && products.length === 0) return null;

  return (
    <section className={bg}>
      <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className={`${playfair.className} flex items-center gap-3 text-3xl font-bold`}
          >
            {title}
            {tag && (
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                {tag}
              </span>
            )}
          </h2>
          {subtitle && <p className="mt-1 text-zinc-600">{subtitle}</p>}
        </div>
        <Link
          href={viewAllLink}
          className="flex shrink-0 items-center gap-1 font-medium text-[rgb(13,148,136)] hover:text-[rgb(15,118,110)]"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-zinc-500">Loading products...</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      </div>
    </section>
  );
}

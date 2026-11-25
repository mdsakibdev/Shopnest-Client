"use client";

import { useEffect, useState } from "react";
import { SERVER_URL } from "@/lib/api";
import { fetchJsonWithRetry } from "@/lib/fetch-retry";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard, { type Product } from "@/components/ProductCard";

type Category = {
  _id: string;
  name: string;
  slug: string;
  section: string;
  image: string;
};

type ProductsResult = {
  products: Product[];
  total: number;
  totalPages: number;
};

// Both loaders live outside the component, so the effects below can
// set state inside .then() — the pattern the Next 16 lint rule accepts.
// They use fetchJsonWithRetry: on a cold first visit the server may
// need a few seconds to wake up, and the page retries by itself
// instead of showing an empty shop. If every try fails, the loader
// throws and the page shows a "Try Again" button.
async function fetchProducts(query: string): Promise<ProductsResult> {
  const data = await fetchJsonWithRetry<{ products?: Product[]; total?: number; totalPages?: number }>(
    `${SERVER_URL}/api/products?${query}`
  );
  return {
    products: data.products || [],
    total: data.total || 0,
    totalPages: data.totalPages || 1,
  };
}

async function fetchCategories(): Promise<Category[]> {
  const data = await fetchJsonWithRetry<Category[]>(
    `${SERVER_URL}/api/categories`
  );
  return Array.isArray(data) ? data : [];
}

// One grey placeholder card, shown while products are loading —
// the grid keeps its shape instead of flashing empty text.
function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-3">
      <div className="aspect-square rounded bg-zinc-200" />
      <div className="mt-3 h-4 rounded bg-zinc-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-zinc-200" />
    </div>
  );
}

const LIMIT = 12; // products per page

type Props = {
  initialSection: string;
  initialCategory: string;
  initialSearch: string;
};

export default function ShopContent({
  initialSection,
  initialCategory,
  initialSearch,
}: Props) {
  const [section, setSection] = useState(initialSection);
  const [category, setCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load the category list once (for the dropdown)
  useEffect(() => {
    let ignore = false;
    fetchCategories()
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch(() => {
        // The dropdown just stays empty if categories cannot load
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Load products whenever a filter, the sort, or the page changes
  useEffect(() => {
    let ignore = false;

    const params = new URLSearchParams();
    params.set("limit", String(LIMIT));
    params.set("page", String(page));
    if (section) params.set("section", section);
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort !== "newest") params.set("sort", sort);

    fetchProducts(params.toString())
      .then((data) => {
        if (!ignore) {
          setProducts(data.products);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setLoading(false);
          setError(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false);
          setError(true);
        }
      });
    return () => {
      ignore = true;
    };
  }, [section, category, search, sort, page, reloadKey]);

  // The "Try Again" button: load once more without a page reload
  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const changeSection = (value: string) => {
    setSection(value);
    setCategory("");
    setPage(1);
  };

  const changeCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSection("");
    setCategory("");
    setSearchInput("");
    setSearch("");
    setSort("newest");
    setPage(1);
  };

  // The category dropdown only shows the chosen section's categories
  const visibleCategories = section
    ? categories.filter((c) => c.section === section)
    : categories;

  const selectedCategory = categories.find((c) => c.slug === category);
  const title = selectedCategory
    ? selectedCategory.name
    : section === "men"
      ? "Men's Collection"
      : section === "women"
        ? "Women's Collection"
        : "Shop All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>{title}</h1>
      <p className="mt-2 text-zinc-600">
        {loading ? (
          "Loading products…"
        ) : error ? (
          "Products could not be loaded"
        ) : (
          <>
            {total} products found
            {search && (
              <>
                {" "}
                for &ldquo;<span className="font-medium">{search}</span>
                &rdquo;
              </>
            )}
          </>
        )}
      </p>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border p-4">
        {/* Section toggle */}
        <div className="flex rounded-md border p-1">
          {[
            { label: "All", value: "" },
            { label: "Men", value: "men" },
            { label: "Women", value: "women" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => changeSection(item.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                section === item.value
                  ? "bg-[rgb(13,148,136)] text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <select
          value={category}
          onChange={(e) => changeCategory(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">All Categories</option>
          {visibleCategories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name} ({c.section})
            </option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-44"
          />
          <Button
            type="submit"
            className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
          >
            Search
          </Button>
        </form>

        {(section || category || search) && (
          <Button type="button" variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 text-center">
          <p className="text-zinc-500">
            Sorry, the products could not be loaded. The server may be
            waking up — please try again.
          </p>
          <Button
            type="button"
            onClick={handleRetry}
            className="mt-4 bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
          >
            Try Again
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-zinc-500">
            No products found. Try a different search or filter.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-zinc-600">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

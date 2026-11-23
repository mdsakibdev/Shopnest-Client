"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { SERVER_URL, getToken } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

type AdminReview = {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ProductLite = {
  _id: string;
  name: string;
};

// Loaders live outside the component, so effects can set state
// inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchReviews(): Promise<AdminReview[]> {
  const res = await fetch(`${SERVER_URL}/api/reviews`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchProducts(): Promise<ProductLite[]> {
  const res = await fetch(`${SERVER_URL}/api/products?limit=100`);
  const data = await res.json();
  return Array.isArray(data.products) ? data.products : [];
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // The review waiting for delete confirmation (FixMate-style modal)
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchReviews().then((data) => {
      if (!ignore) {
        setReviews(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchProducts().then((data) => {
      if (!ignore) setProducts(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const productName = (productId: string) =>
    products.find((p) => p._id === productId)?.name || "Unknown product";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = await getToken();
    const res = await fetch(`${SERVER_URL}/api/reviews/${deleteTarget._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      setMessage("Could not delete the review. Please try again.");
      return;
    }
    setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    setMessage("Review deleted.");
  };

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <h1 className={`${playfair.className} text-3xl font-bold`}>Reviews</h1>
      <p className="mt-1 text-zinc-600">
        {reviews.length} reviews
        {reviews.length > 0 && <> · average rating {average.toFixed(1)} / 5</>}
      </p>

      {message && (
        <p className="mt-4 rounded-md bg-[rgb(204,251,241)] px-3 py-2 text-sm text-[rgb(15,118,110)]">
          {message}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-zinc-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="mt-8 text-zinc-500">
          No reviews yet. Reviews customers write on product pages will
          appear here.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-lg border p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/product/${review.productId}`}
                    className="font-semibold hover:text-[rgb(13,148,136)]"
                  >
                    {productName(review.productId)}
                  </Link>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    by {review.userName} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(review)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
              <div className="mt-2">
                <Stars value={review.rating} />
              </div>
              <p className="mt-2 text-zinc-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete this review?</h2>
            <p className="mt-2 text-sm text-zinc-600">
              The review by{" "}
              <span className="font-medium">{deleteTarget.userName}</span> on{" "}
              <span className="font-medium">
                {productName(deleteTarget.productId)}
              </span>{" "}
              will be removed permanently.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

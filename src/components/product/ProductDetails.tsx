"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banknote, Minus, Plus, Star, Truck } from "lucide-react";
import { SERVER_URL, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import ProductCard, { type Product } from "@/components/ProductCard";

type Review = {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

// Loaders live outside the component, so effects can set state
// inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${SERVER_URL}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`${SERVER_URL}/api/reviews?productId=${productId}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchRelated(
  category: string,
  excludeId: string
): Promise<Product[]> {
  const res = await fetch(
    `${SERVER_URL}/api/products?category=${category}&limit=8`
  );
  const data = await res.json();
  const all: Product[] = data.products || [];
  return all.filter((p) => p._id !== excludeId).slice(0, 4);
}

// A row of 5 stars — filled up to the given value
function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
        />
      ))}
    </span>
  );
}

export default function ProductDetails({ id }: { id: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addItem, setIsOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColour, setSelectedColour] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load the product, and pre-select its first size and colour
  useEffect(() => {
    let ignore = false;
    fetchProduct(id).then((data) => {
      if (!ignore) {
        setProduct(data);
        setLoading(false);
        if (data) {
          setSelectedSize(data.sizes[0] || "");
          setSelectedColour(data.colours[0] || "");
        }
      }
    });
    return () => {
      ignore = true;
    };
  }, [id]);

  // Load this product's reviews
  useEffect(() => {
    let ignore = false;
    fetchReviews(id).then((data) => {
      if (!ignore) setReviews(data);
    });
    return () => {
      ignore = true;
    };
  }, [id]);

  // Load related products once the product (and its category) is known
  useEffect(() => {
    if (!product) return;
    let ignore = false;
    fetchRelated(product.category, product._id).then((data) => {
      if (!ignore) setRelated(data);
    });
    return () => {
      ignore = true;
    };
  }, [product]);

  // Add to Cart puts the chosen size/colour/quantity into the cart
  // (the drawer opens by itself, so the customer sees it worked)
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0] || "",
      price: product.discountPrice || product.price,
      size: selectedSize,
      colour: selectedColour,
      quantity,
    });
  };

  // Buy Now does the same add, then goes straight to checkout (Step 11)
  const handleBuyNow = () => {
    handleAddToCart();
    setIsOpen(false);
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMessage("");
    setReviewError("");
    setSubmitting(true);

    const token = await getToken();
    const res = await fetch(`${SERVER_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: id, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setReviewError(data.message || "Could not add the review");
      return;
    }
    setComment("");
    setRating(5);
    setReviewMessage("Thank you! Your review was added.");
    fetchReviews(id).then((data) => setReviews(data));
  };

  if (loading) {
    return <p className="mx-auto max-w-7xl px-4 py-10">Loading product...</p>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className={`${playfair.className} text-3xl font-bold`}>
          Product not found
        </h1>
        <p className="mt-2 text-zinc-600">
          This product may have been removed.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block font-medium text-[rgb(13,148,136)] underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const finalPrice = product.discountPrice || product.price;
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-zinc-100">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          )}
          {product.discountPrice && (
            <span className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
              Save ৳{product.price - product.discountPrice}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium tracking-wide text-[rgb(13,148,136)] uppercase">
            {product.category.replace(/-/g, " ")} · {product.section}
          </p>
          <h1 className={`${playfair.className} mt-2 text-3xl font-bold`}>
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Stars value={average} />
            <span className="text-sm text-zinc-600">
              {reviews.length > 0
                ? `${average.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}`
                : "No reviews yet"}
            </span>
          </div>

          <p className="mt-4">
            <span className="text-3xl font-bold text-[rgb(13,148,136)]">
              ৳{finalPrice}
            </span>{" "}
            {product.discountPrice && (
              <span className="text-lg text-zinc-400 line-through">
                ৳{product.price}
              </span>
            )}
          </p>

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="font-medium text-green-600">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="font-medium text-red-500">Stock Out</span>
            )}
          </p>

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="font-medium">
                Size: <span className="text-zinc-600">{selectedSize}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      selectedSize === size
                        ? "border-[rgb(13,148,136)] bg-[rgb(13,148,136)] text-white"
                        : "hover:border-[rgb(13,148,136)]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colours */}
          {product.colours.length > 0 && (
            <div className="mt-5">
              <p className="font-medium">
                Colour: <span className="text-zinc-600">{selectedColour}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colours.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    onClick={() => setSelectedColour(colour)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      selectedColour === colour
                        ? "border-[rgb(13,148,136)] bg-[rgb(13,148,136)] text-white"
                        : "hover:border-[rgb(13,148,136)]"
                    }`}
                  >
                    {colour}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-3">
            <p className="font-medium">Quantity:</p>
            <div className="flex items-center rounded-md border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-zinc-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock || 1, q + 1))
                }
                className="px-3 py-2 hover:bg-zinc-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Buttons — Add to Cart opens the drawer with the item in
              it; Buy Now adds and goes straight to checkout */}
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="flex-1 border-[rgb(13,148,136)] py-6 text-base font-semibold text-[rgb(15,118,110)] hover:bg-[rgb(204,251,241)]"
            >
              Add to Cart
            </Button>
            <Button
              type="button"
              disabled={product.stock === 0}
              onClick={handleBuyNow}
              className="flex-1 bg-[rgb(13,148,136)] py-6 text-base font-semibold text-white hover:bg-[rgb(15,118,110)]"
            >
              Buy Now
            </Button>
          </div>

          <div className="mt-6 space-y-2 border-t pt-5 text-sm text-zinc-600">
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[rgb(13,148,136)]" /> Home
              delivery all over Bangladesh
            </p>
            <p className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[rgb(13,148,136)]" /> Cash on
              Delivery available
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t pt-5">
              <h2 className={`${playfair.className} text-xl font-bold`}>
                Description
              </h2>
              <p className="mt-2 leading-relaxed text-zinc-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className={`${playfair.className} text-2xl font-bold`}>
          Customer Reviews ({reviews.length})
        </h2>

        {session?.user ? (
          <form
            onSubmit={handleReviewSubmit}
            className="mt-5 space-y-3 rounded-lg border p-5"
          >
            <p className="font-medium">Write a review</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-label={`${i} star${i > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-7 w-7 ${
                      i <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-zinc-600">{rating}/5</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the quality? Did the size fit well?"
              rows={3}
              required
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
            >
              {submitting ? "Posting..." : "Post Review"}
            </Button>
            {reviewMessage && (
              <p className="text-sm text-green-600">{reviewMessage}</p>
            )}
            {reviewError && (
              <p className="text-sm text-red-500">{reviewError}</p>
            )}
          </form>
        ) : (
          <p className="mt-5 rounded-lg border p-5 text-sm text-zinc-600">
            Please{" "}
            <Link
              href="/login"
              className="font-medium text-[rgb(13,148,136)] underline"
            >
              login
            </Link>{" "}
            to write a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="mt-6 text-zinc-500">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="mt-6 divide-y rounded-lg border">
            {reviews.map((review) => (
              <div key={review._id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.userName}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-1">
                  <Stars value={review.rating} />
                </div>
                <p className="mt-2 text-zinc-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className={`${playfair.className} text-2xl font-bold`}>
            Related Products
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

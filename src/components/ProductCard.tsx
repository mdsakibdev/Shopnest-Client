import Image from "next/image";
import Link from "next/link";

export type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  category: string;
  section: string;
  images: string[];
  description: string;
  sizes: string[];
  colours: string[];
  stock: number;
  featured: boolean;
  flashSale: boolean;
};

// One product card — used on the home page now,
// and again on the Shop page (Step 8), so it lives in one place.
export default function ProductCard({ product }: { product: Product }) {
  const discountPercent = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group overflow-hidden rounded-lg border bg-white hover:border-[rgb(13,148,136)]"
    >
      <div className="relative aspect-3/4 w-full bg-zinc-100">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        )}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-white">
            Stock Out
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs tracking-wide text-zinc-500 uppercase">
          {product.category.replace(/-/g, " ")}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-10 font-medium">
          {product.name}
        </h3>
        <p className="mt-2">
          {product.discountPrice ? (
            <>
              <span className="text-lg font-bold text-[rgb(13,148,136)]">
                ৳{product.discountPrice}
              </span>{" "}
              <span className="text-sm text-zinc-400 line-through">
                ৳{product.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-[rgb(13,148,136)]">
              ৳{product.price}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

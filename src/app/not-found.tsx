import Link from "next/link";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

// Custom 404 page — shown whenever a visitor opens an address
// that does not exist, in the shop's own design instead of the
// plain Next.js default.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p
        className={`${playfair.className} text-7xl font-bold text-[rgb(13,148,136)]`}
      >
        404
      </p>
      <h1 className={`${playfair.className} mt-4 text-3xl font-bold`}>
        Page not found
      </h1>
      <p className="mt-3 text-zinc-600">
        The page you are looking for does not exist, or it may have
        been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button
            variant="outline"
            className="border-[rgb(13,148,136)] font-semibold text-[rgb(15,118,110)] hover:bg-[rgb(204,251,241)]"
          >
            Go to Home
          </Button>
        </Link>
        <Link href="/shop">
          <Button className="bg-[rgb(13,148,136)] font-semibold text-white hover:bg-[rgb(15,118,110)]">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

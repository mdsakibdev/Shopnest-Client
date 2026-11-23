import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

// Order success page (Server Component) — the address looks like
// /order-success?id=64f... and the order ID shown here is what the
// customer uses later on the Track My Order page.
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.id || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-[rgb(13,148,136)]" />
      <h1 className={`${playfair.className} mt-4 text-3xl font-bold`}>
        Thank you! Your order has been placed.
      </h1>
      <p className="mt-3 text-zinc-600">
        We have received your order. We will call you soon to confirm it.
      </p>

      {orderId ? (
        <div className="mt-8 rounded-lg border bg-zinc-50 p-5">
          <p className="text-sm text-zinc-500">Your Order ID</p>
          <p className="mt-1 font-mono text-lg font-bold break-all">
            {orderId}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Save this ID — you can check your order status anytime with it.
          </p>
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-500">
          No order ID was found with this page.
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {orderId && (
          <Link href={`/track-order?id=${orderId}`}>
            <Button
              variant="outline"
              className="border-[rgb(13,148,136)] font-semibold text-[rgb(15,118,110)] hover:bg-[rgb(204,251,241)]"
            >
              Track My Order
            </Button>
          </Link>
        )}
        <Link href="/shop">
          <Button className="bg-[rgb(13,148,136)] font-semibold text-white hover:bg-[rgb(15,118,110)]">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

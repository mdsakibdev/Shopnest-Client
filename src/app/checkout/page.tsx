"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Smartphone } from "lucide-react";
import { SERVER_URL, getToken } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// These two values move into the admin Settings in Step 14,
// so each shop owner can set their own.
const DELIVERY_INSIDE_DHAKA = 60;
const DELIVERY_OUTSIDE_DHAKA = 120;
const BKASH_NUMBER = "01700-000000";

// The session arrives a moment after the page opens, so the
// customer's name is filled in through this small async helper —
// the .then() pattern the Next 16 lint rule accepts.
async function readName(name: string): Promise<string> {
  return name;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("inside");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashTrxId, setBkashTrxId] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  // Pre-fill the name when the customer is logged in
  useEffect(() => {
    const name = session?.user?.name;
    if (!name) return;
    let ignore = false;
    readName(name).then((value) => {
      if (!ignore) setCustomerName((prev) => prev || value);
    });
    return () => {
      ignore = true;
    };
  }, [session]);

  const deliveryCharge =
    area === "inside" ? DELIVERY_INSIDE_DHAKA : DELIVERY_OUTSIDE_DHAKA;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPlacing(true);

    // Logged-in customers get the order linked to their account;
    // guests simply send no token.
    const token = await getToken().catch(() => null);

    const res = await fetch(`${SERVER_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        customerName,
        phone,
        address,
        area,
        paymentMethod,
        bkashNumber,
        bkashTrxId,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          colour: item.colour,
          quantity: item.quantity,
        })),
      }),
    });
    const data = await res.json();
    setPlacing(false);

    if (!res.ok) {
      setError(data.message || "Could not place the order");
      return;
    }

    clearCart();
    router.push(`/order-success?id=${data.orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className={`${playfair.className} text-3xl font-bold`}>
          Your cart is empty
        </h1>
        <p className="mt-2 text-zinc-600">
          Add some products before checking out.
        </p>
        <Link href="/shop">
          <Button className="mt-6 bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]">
            Go to Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Delivery + payment form */}
        <form
          onSubmit={handlePlaceOrder}
          className="space-y-6 rounded-lg border p-6"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Delivery Information</h2>
            <div className="space-y-2">
              <Label htmlFor="customerName">Your Name</Label>
              <Input
                id="customerName"
                placeholder="e.g. Md Sakib"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                placeholder="e.g. 01700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <textarea
                id="address"
                placeholder="House, Road, Area, District"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Area</Label>
              <div className="flex rounded-md border p-1">
                {[
                  {
                    label: `Inside Dhaka (৳${DELIVERY_INSIDE_DHAKA})`,
                    value: "inside",
                  },
                  {
                    label: `Outside Dhaka (৳${DELIVERY_OUTSIDE_DHAKA})`,
                    value: "outside",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setArea(option.value)}
                    className={`flex-1 rounded px-3 py-2 text-sm font-medium ${
                      area === option.value
                        ? "bg-[rgb(13,148,136)] text-white"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-5">
            <h2 className="text-lg font-semibold">Payment Method</h2>

            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left ${
                paymentMethod === "cod"
                  ? "border-[rgb(13,148,136)] bg-[rgb(204,251,241)]/40"
                  : "hover:border-[rgb(13,148,136)]"
              }`}
            >
              <Banknote className="h-6 w-6 shrink-0 text-[rgb(13,148,136)]" />
              <span>
                <span className="block font-medium">Cash on Delivery</span>
                <span className="block text-sm text-zinc-500">
                  Pay when you receive your products
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("bkash")}
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left ${
                paymentMethod === "bkash"
                  ? "border-[rgb(13,148,136)] bg-[rgb(204,251,241)]/40"
                  : "hover:border-[rgb(13,148,136)]"
              }`}
            >
              <Smartphone className="h-6 w-6 shrink-0 text-[rgb(13,148,136)]" />
              <span>
                <span className="block font-medium">bKash (Manual)</span>
                <span className="block text-sm text-zinc-500">
                  Send money now and give the transaction ID
                </span>
              </span>
            </button>

            {paymentMethod === "bkash" && (
              <div className="space-y-4 rounded-lg border border-dashed p-4">
                <p className="text-sm">
                  Send Money (Personal) to:{" "}
                  <span className="font-bold">{BKASH_NUMBER}</span>
                  <br />
                  Amount: <span className="font-bold">৳{total}</span> — then
                  fill in these two boxes:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="bkashNumber">Your bKash Number</Label>
                  <Input
                    id="bkashNumber"
                    placeholder="e.g. 01700000000"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    required={paymentMethod === "bkash"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkashTrxId">Transaction ID (TrxID)</Label>
                  <Input
                    id="bkashTrxId"
                    placeholder="e.g. 9HX7ABCDEF"
                    value={bkashTrxId}
                    onChange={(e) => setBkashTrxId(e.target.value)}
                    required={paymentMethod === "bkash"}
                  />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={placing}
            className="w-full bg-[rgb(13,148,136)] py-6 text-base font-semibold text-white hover:bg-[rgb(15,118,110)]"
          >
            {placing ? "Placing Order..." : `Place Order — ৳${total}`}
          </Button>
        </form>

        {/* Order summary */}
        <div className="h-fit rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.colour}`}
                className="flex items-center gap-3"
              >
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded border bg-zinc-100">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-snug font-medium">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Size: {item.size || "N/A"} · Colour: {item.colour || "N/A"}{" "}
                    · ×{item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  ৳{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Delivery Charge</span>
              <span>৳{deliveryCharge}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-[rgb(13,148,136)]">৳{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

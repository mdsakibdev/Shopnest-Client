"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { Check, XCircle } from "lucide-react";
import { SERVER_URL } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TrackedItem = {
  name: string;
  image: string;
  price: number;
  size: string;
  colour: string;
  quantity: number;
};

type TrackedOrder = {
  _id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: TrackedItem[];
  total: number;
  createdAt: string;
};

// Loader lives outside the component, so the effect below can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchTrack(
  id: string
): Promise<{ order: TrackedOrder | null; message: string }> {
  try {
    const res = await fetch(`${SERVER_URL}/api/orders/track/${id}`);
    const data = await res.json();
    if (!res.ok) {
      return { order: null, message: data.message || "Order not found" };
    }
    return { order: data, message: "" };
  } catch {
    return { order: null, message: "Could not reach the server" };
  }
}

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  "pending-verify": "Pending verification",
  paid: "Paid",
  failed: "Payment failed",
};

export default function TrackOrderContent({
  initialId,
}: {
  initialId: string;
}) {
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(!!initialId);

  // Arriving from the success page (the link carries ?id=...) —
  // look the order up right away
  useEffect(() => {
    if (!initialId) return;
    let ignore = false;
    fetchTrack(initialId).then((result) => {
      if (!ignore) {
        setOrder(result.order);
        setMessage(result.message);
        setSearching(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    setSearching(true);
    setOrder(null);
    setMessage("");
    fetchTrack(id).then((result) => {
      setOrder(result.order);
      setMessage(result.message);
      setSearching(false);
    });
  };

  const currentStep = order
    ? STEPS.findIndex((step) => step.key === order.status)
    : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>
        Track My Order
      </h1>
      <p className="mt-2 text-zinc-600">
        Enter the Order ID you received after placing your order.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <Input
          placeholder="Paste your Order ID here"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="font-mono"
        />
        <Button
          type="submit"
          disabled={searching}
          className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
        >
          {searching ? "Searching..." : "Track"}
        </Button>
      </form>

      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

      {order && (
        <div className="mt-8 rounded-lg border p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-zinc-500">Order ID</p>
              <p className="font-mono font-bold break-all">{order._id}</p>
            </div>
            <p className="text-sm text-zinc-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Status steps */}
          {order.status === "cancelled" ? (
            <p className="mt-6 flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 font-medium text-red-600">
              <XCircle className="h-5 w-5" /> This order was cancelled.
              Please contact us if you have any questions.
            </p>
          ) : (
            <div className="mt-8 flex items-start">
              {STEPS.map((step, i) => (
                <Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                        i <= currentStep
                          ? "bg-[rgb(13,148,136)] text-white"
                          : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {i < currentStep ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs font-medium ${
                        i <= currentStep
                          ? "text-[rgb(15,118,110)]"
                          : "text-zinc-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-2 mt-4 h-1 flex-1 rounded ${
                        i < currentStep
                          ? "bg-[rgb(13,148,136)]"
                          : "bg-zinc-200"
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          )}

          {/* Items */}
          <div className="mt-8 space-y-4 border-t pt-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
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

          <div className="mt-5 flex flex-wrap justify-between gap-2 border-t pt-4 text-sm">
            <p className="text-zinc-600">
              Payment:{" "}
              <span className="font-medium text-zinc-900">
                {order.paymentMethod === "bkash"
                  ? "bKash"
                  : "Cash on Delivery"}{" "}
                ({PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus})
              </span>
            </p>
            <p className="text-base font-bold">
              Total:{" "}
              <span className="text-[rgb(13,148,136)]">৳{order.total}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

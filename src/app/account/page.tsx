"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVER_URL, getToken } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

type OrderItem = {
  name: string;
  image: string;
  price: number;
  size: string;
  colour: string;
  quantity: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

// Loader lives outside the component, so the effect below can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchMyOrders(token: string | null): Promise<Order[]> {
  if (!token) return [];
  const res = await fetch(`${SERVER_URL}/api/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  "pending-verify": "Pending verification",
  paid: "Paid",
  failed: "Payment failed",
};

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const user = session?.user;

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    getToken()
      .then((token) => fetchMyOrders(token ?? null))
      .then((data) => {
        if (!ignore) {
          setOrders(data);
          setLoadingOrders(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [user]);

  if (isPending) {
    return <p className="mx-auto max-w-7xl px-4 py-10">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className={`${playfair.className} text-3xl font-bold`}>
          My Account
        </h1>
        <p className="mt-3 text-zinc-600">
          Please login to see your account and your orders.
        </p>
        <Link href="/login">
          <Button className="mt-6 bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>My Account</h1>

      {/* Profile */}
      <div className="mt-6 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-3 space-y-1 text-sm">
          <p>
            <span className="text-zinc-500">Name:</span>{" "}
            <span className="font-medium">{user.name}</span>
          </p>
          <p>
            <span className="text-zinc-500">Email:</span>{" "}
            <span className="font-medium">{user.email}</span>
          </p>
          {user.phone && (
            <p>
              <span className="text-zinc-500">Phone:</span>{" "}
              <span className="font-medium">{user.phone}</span>
            </p>
          )}
          <p>
            <span className="text-zinc-500">Account type:</span>{" "}
            <span className="font-medium capitalize">{user.role}</span>
          </p>
        </div>
      </div>

      {/* My Orders */}
      <h2 className={`${playfair.className} mt-10 text-2xl font-bold`}>
        My Orders ({orders.length})
      </h2>

      {loadingOrders ? (
        <p className="mt-4 text-zinc-500">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="mt-4 rounded-lg border p-6 text-center">
          <p className="text-zinc-500">
            You have not placed any orders yet.
          </p>
          <Link href="/shop">
            <Button className="mt-4 bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]">
              Go to Shop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-lg border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm font-bold break-all">
                  {order._id}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    STATUS_STYLES[order.status] || "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(order.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {order.paymentMethod === "bkash" ? "bKash" : "Cash on Delivery"}{" "}
                ({PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus})
              </p>

              <div className="mt-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded border bg-zinc-100">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="flex-1 text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="block text-xs text-zinc-500">
                        Size: {item.size || "N/A"} · Colour:{" "}
                        {item.colour || "N/A"} · ×{item.quantity}
                      </span>
                    </p>
                    <p className="text-sm font-semibold">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between border-t pt-3 text-sm">
                <Link
                  href={`/track-order?id=${order._id}`}
                  className="font-medium text-[rgb(13,148,136)] underline"
                >
                  Track this order
                </Link>
                <p className="font-bold">
                  Total:{" "}
                  <span className="text-[rgb(13,148,136)]">
                    ৳{order.total}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

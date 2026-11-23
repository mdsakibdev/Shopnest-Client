"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Clock,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { SERVER_URL, getToken } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { playfair } from "@/lib/fonts";

type Stats = {
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
};

type RecentOrder = {
  _id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

// Loaders live outside the component, so effects can set state
// inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchStats(token: string): Promise<Stats | null> {
  const res = await fetch(`${SERVER_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchRecentOrders(token: string): Promise<RecentOrder[]> {
  const res = await fetch(`${SERVER_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return Array.isArray(data) ? data.slice(0, 5) : [];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    let ignore = false;
    getToken()
      .then((token) => fetchStats(token))
      .then((data) => {
        if (!ignore) setStats(data);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    getToken()
      .then((token) => fetchRecentOrders(token))
      .then((data) => {
        if (!ignore) setRecentOrders(data);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Orders",
          value: String(stats.totalOrders),
          icon: ShoppingBag,
        },
        { label: "Revenue", value: `৳${stats.revenue}`, icon: Banknote },
        {
          label: "Pending Orders",
          value: String(stats.pendingOrders),
          icon: Clock,
        },
        {
          label: "Products",
          value: String(stats.totalProducts),
          icon: Package,
        },
        {
          label: "Customers",
          value: String(stats.totalCustomers),
          icon: Users,
        },
      ]
    : [];

  return (
    <div>
      <h1 className={`${playfair.className} text-3xl font-bold`}>Dashboard</h1>
      <p className="mt-1 text-zinc-600">
        Welcome, {session?.user?.name}. Here is your shop at a glance.
      </p>

      {/* Stat cards */}
      {stats === null ? (
        <p className="mt-8 text-zinc-500">Loading stats...</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-lg border p-5">
                <Icon className="h-6 w-6 text-[rgb(13,148,136)]" />
                <p className="mt-3 text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-zinc-500">{card.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent orders */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className={`${playfair.className} text-2xl font-bold`}>
          Recent Orders
        </h2>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-[rgb(13,148,136)] underline"
        >
          Manage all orders
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="mt-4 text-zinc-500">No orders yet.</p>
      ) : (
        <div className="mt-4 divide-y rounded-lg border">
          {recentOrders.map((order) => (
            <div
              key={order._id}
              className="flex flex-wrap items-center gap-2 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs break-all text-zinc-500">
                  {order._id}
                </p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <p className="text-sm text-zinc-500">
                {new Date(order.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="font-semibold">৳{order.total}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  STATUS_STYLES[order.status] || "bg-zinc-100 text-zinc-600"
                }`}
              >
                {order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

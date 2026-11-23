"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SERVER_URL, getToken } from "@/lib/api";
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

type AdminOrder = {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  bkashNumber: string;
  bkashTrxId: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

// Loader lives outside the component, so the effect below can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchOrders(token: string): Promise<AdminOrder[]> {
  const res = await fetch(`${SERVER_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getToken()
      .then((token) => fetchOrders(token))
      .then((data) => {
        if (!ignore) {
          setOrders(data);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const changeStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    setMessage("");
    const token = await getToken();
    const res = await fetch(`${SERVER_URL}/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (!res.ok) {
      setMessage("Could not update the status. Please try again.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status } : o))
    );
    setMessage("Order status updated.");
  };

  const changePayment = async (orderId: string, paymentStatus: string) => {
    setUpdatingId(orderId);
    setMessage("");
    const token = await getToken();
    const res = await fetch(`${SERVER_URL}/api/orders/${orderId}/payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus }),
    });
    setUpdatingId(null);
    if (!res.ok) {
      setMessage("Could not update the payment. Please try again.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, paymentStatus } : o))
    );
    setMessage("Payment status updated.");
  };

  const visibleOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const countFor = (status: string) =>
    status === "all"
      ? orders.length
      : orders.filter((o) => o.status === status).length;

  return (
    <div>
      <h1 className={`${playfair.className} text-3xl font-bold`}>Orders</h1>
      <p className="mt-1 text-zinc-600">
        Total {orders.length} orders. Click an order to see its details.
      </p>

      {/* Status filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              filter === status
                ? "bg-[rgb(13,148,136)] text-white"
                : "border text-zinc-600 hover:border-[rgb(13,148,136)]"
            }`}
          >
            {status} ({countFor(status)})
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-4 rounded-md bg-[rgb(204,251,241)] px-3 py-2 text-sm text-[rgb(15,118,110)]">
          {message}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-zinc-500">Loading orders...</p>
      ) : visibleOrders.length === 0 ? (
        <p className="mt-8 text-zinc-500">
          No orders in this group yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleOrders.map((order) => {
            const expanded = expandedId === order._id;
            return (
              <div key={order._id} className="rounded-lg border">
                {/* Summary row */}
                <div className="flex flex-wrap items-center gap-2 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs break-all text-zinc-500">
                      {order._id}
                    </p>
                    <p className="font-medium">
                      {order.customerName}{" "}
                      <span className="text-sm font-normal text-zinc-500">
                        · {order.phone}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="font-semibold">৳{order.total}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      STATUS_STYLES[order.status] ||
                      "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    className="flex items-center gap-1 text-sm font-medium text-[rgb(13,148,136)]"
                  >
                    {expanded ? (
                      <>
                        Hide <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Details <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {expanded && (
                  <div className="border-t p-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Customer + items */}
                      <div>
                        <p className="text-sm">
                          <span className="text-zinc-500">Address:</span>{" "}
                          {order.address} (
                          {order.area === "inside"
                            ? "Inside Dhaka"
                            : "Outside Dhaka"}
                          )
                        </p>
                        <p className="mt-1 text-sm">
                          <span className="text-zinc-500">Payment:</span>{" "}
                          {order.paymentMethod === "bkash"
                            ? "bKash"
                            : "Cash on Delivery"}{" "}
                          —{" "}
                          {PAYMENT_LABELS[order.paymentStatus] ||
                            order.paymentStatus}
                        </p>
                        {order.paymentMethod === "bkash" && (
                          <p className="mt-1 text-sm">
                            <span className="text-zinc-500">
                              Sender number:
                            </span>{" "}
                            {order.bkashNumber}
                            <br />
                            <span className="text-zinc-500">TrxID:</span>{" "}
                            <span className="font-mono font-medium">
                              {order.bkashTrxId}
                            </span>
                          </p>
                        )}

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

                        <div className="mt-4 space-y-1 border-t pt-3 text-sm">
                          <p className="flex justify-between">
                            <span className="text-zinc-500">Subtotal</span>
                            <span>৳{order.subtotal}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-zinc-500">
                              Delivery charge
                            </span>
                            <span>৳{order.deliveryCharge}</span>
                          </p>
                          <p className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>৳{order.total}</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Order status</p>
                          <select
                            value={order.status}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              changeStatus(order._id, e.target.value)
                            }
                            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-zinc-500">
                            The customer sees this change on the Track My
                            Order page right away.
                          </p>
                        </div>

                        {order.paymentStatus === "pending-verify" && (
                          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-800">
                              bKash payment is waiting for verification.
                              Check the TrxID in your bKash messages, then:
                            </p>
                            <div className="mt-3 flex gap-2">
                              <Button
                                type="button"
                                disabled={updatingId === order._id}
                                onClick={() =>
                                  changePayment(order._id, "paid")
                                }
                                className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
                              >
                                Mark as Paid
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={updatingId === order._id}
                                onClick={() =>
                                  changePayment(order._id, "failed")
                                }
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Mark as Failed
                              </Button>
                            </div>
                          </div>
                        )}

                        {order.paymentMethod === "cod" &&
                          order.paymentStatus === "unpaid" && (
                            <div>
                              <p className="text-sm font-medium">
                                Cash on Delivery payment
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={updatingId === order._id}
                                onClick={() =>
                                  changePayment(order._id, "paid")
                                }
                                className="mt-2 border-[rgb(13,148,136)] text-[rgb(15,118,110)] hover:bg-[rgb(204,251,241)]"
                              >
                                Mark as Paid (cash received)
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

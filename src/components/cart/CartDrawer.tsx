"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

// The cart panel that slides in from the right when the customer
// clicks the cart icon (or adds a product).
export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  if (!isOpen) return null;

  const close = () => setIsOpen(false);

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay — click to close */}
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className={`${playfair.className} text-xl font-bold`}>
            Shopping Cart ({totalItems})
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="rounded-full p-1 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-300" />
            <p className="text-zinc-500">Your cart is empty.</p>
            <Button
              type="button"
              onClick={close}
              className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.colour}`}
                  className="flex gap-3 p-4"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded border bg-zinc-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-snug font-medium">{item.name}</p>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() =>
                          removeItem(item.productId, item.size, item.colour)
                        }
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Size: {item.size || "N/A"} · Colour:{" "}
                      {item.colour || "N/A"} · ৳{item.price} each
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.colour,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-1 hover:bg-zinc-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.colour,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-1 hover:bg-zinc-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-[rgb(13,148,136)]">
                        ৳{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Delivery charge will be added at checkout.
              </p>
              <Link href="/checkout" onClick={close}>
                <Button className="mt-3 w-full bg-[rgb(13,148,136)] py-6 text-base font-semibold text-white hover:bg-[rgb(15,118,110)]">
                  Proceed to Checkout
                </Button>
              </Link>
              <button
                type="button"
                onClick={close}
                className="mt-2 w-full text-center text-sm font-medium text-[rgb(13,148,136)] underline"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

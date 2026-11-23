"use client";

import { createContext, useContext, useEffect, useState } from "react";

// One line in the cart. The same product in a different size or
// colour is a separate line.
export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number; // final unit price (after discount)
  size: string;
  colour: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, colour: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    colour: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "shopnest-cart";

// Reads the saved cart from the browser. Kept outside the component
// (and async) so the effect below can set state inside .then() —
// the pattern the Next 16 lint rule accepts.
async function loadSavedCart(): Promise<CartItem[]> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load the saved cart once, when the app first opens
  useEffect(() => {
    let ignore = false;
    loadSavedCart().then((saved) => {
      if (!ignore) {
        setItems(saved);
        setLoaded(true);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Save the cart every time it changes (but not before the first
  // load finishes — otherwise the empty cart would wipe the saved one)
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          i.colour === newItem.colour
      );
      if (existing) {
        return prev.map((i) =>
          i === existing
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
    setIsOpen(true); // open the drawer so the customer sees it was added
  };

  const removeItem = (productId: string, size: string, colour: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.size === size &&
            i.colour === colour
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    size: string,
    colour: string,
    quantity: number
  ) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size && i.colour === colour
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Any component inside the provider can use the cart through this hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

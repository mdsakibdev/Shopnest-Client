"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { SERVER_URL } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const menuLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/shop?section=men" },
  { label: "Women", href: "/shop?section=women" },
  { label: "Track Order", href: "/track-order" },
  { label: "About", href: "/about" },
];

type ShopSettings = {
  shopName?: string;
  logo?: string;
  hotline?: string;
};

// The loader lives outside the component, so the effect can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
// A failed request simply keeps the values from lib/site.
async function fetchSettings(): Promise<ShopSettings | null> {
  try {
    const res = await fetch(`${SERVER_URL}/api/settings`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchSettings().then((data) => {
      if (!ignore && data) setSettings(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-[rgb(13,148,136)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs sm:text-sm">
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Hotline: {settings?.hotline || site.hotline}
          </p>
          <p className="hidden sm:block">Cash on Delivery all over Bangladesh</p>
          <Link href="/track-order" className="underline-offset-2 hover:underline">
            Track My Order
          </Link>
        </div>
      </div>

      {/* Main navbar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className={`${playfair.className} text-2xl font-bold sm:text-3xl`}
        >
          {settings?.logo ? (
            // The logo link comes from admin Settings, so it can be
            // from any website — a plain <img> works with every link,
            // while next/image would need each domain allowed first.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo}
              alt={settings.shopName || site.name}
              className="h-12 w-auto"
            />
          ) : (
            <>
              Shop<span className="text-[rgb(13,148,136)]">Nest</span>
            </>
          )}
        </Link>

        {/* Search — connects to the Shop page in a later step */}
        <form action="/shop" className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-xl">
            <Input
              name="search"
              placeholder="Search for Panjabi, Saree, T-shirt..."
              className="pr-10"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[rgb(13,148,136)]"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Cart — drawer comes in the Cart step, count is 0 for now */}
          <button
            type="button"
            aria-label="Cart"
            className="relative rounded-full p-2 hover:bg-zinc-100"
          >
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(13,148,136)] text-[11px] font-bold text-white">
              0
            </span>
          </button>

          {user ? (
            <>
              <span className="hidden text-sm font-medium lg:block">
                {user.name}
              </span>
              {user.role === "admin" ? (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              ) : (
                <Link href="/account">
                  <Button variant="outline" size="sm">
                    My Account
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
                >
                  Register
                </Button>
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-2 hover:bg-zinc-100 md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Category menu — desktop */}
      <nav className="hidden border-t md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 text-sm font-medium">
          {menuLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[rgb(13,148,136)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Category menu — mobile */}
      {menuOpen && (
        <nav className="border-t md:hidden">
          <div className="space-y-1 px-4 py-2 text-sm font-medium">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded px-2 py-2 hover:bg-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

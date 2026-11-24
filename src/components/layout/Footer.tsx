import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { playfair } from "@/lib/fonts";
import { site } from "@/lib/site";

type ShopSettings = {
  shopName?: string;
  hotline?: string;
  email?: string;
  address?: string;
};

// Settings come from the server. If the server is off, the values
// from lib/site are used instead — the footer never breaks the page.
async function readSettings(): Promise<ShopSettings | null> {
  try {
    const base =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    const res = await fetch(`${base}/api/settings`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const menLinks = [
  { label: "Panjabi", href: "/shop?section=men&category=panjabi" },
  { label: "T-shirt", href: "/shop?section=men&category=t-shirt" },
  { label: "Shirt", href: "/shop?section=men&category=shirt" },
  { label: "Polo", href: "/shop?section=men&category=polo" },
  { label: "Pant & Trouser", href: "/shop?section=men&category=pant-and-trouser" },
];

const womenLinks = [
  { label: "Saree", href: "/shop?section=women&category=saree" },
  { label: "Three-Piece", href: "/shop?section=women&category=three-piece" },
  { label: "Kurti", href: "/shop?section=women&category=kurti" },
];

const careLinks = [
  { label: "Track My Order", href: "/track-order" },
  { label: "My Account", href: "/account" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "About / Contact", href: "/about" },
];

export default async function Footer() {
  const settings = await readSettings();
  const shopName = settings?.shopName || site.name;
  const hotline = settings?.hotline || site.hotline;
  const email = settings?.email || site.email;
  const address = settings?.address || site.address;
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <p className={`${playfair.className} text-3xl font-bold text-white`}>
            Shop<span className="text-[rgb(20,184,166)]">Nest</span>
          </p>
          <p className="mt-3 text-sm leading-6">
            Fashion for men and women. Quality checked products with home
            delivery all over Bangladesh.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[rgb(20,184,166)]" /> {hotline}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[rgb(20,184,166)]" /> {email}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[rgb(20,184,166)]" /> {address}
            </p>
          </div>
        </div>

        {/* Men */}
        <div>
          <h3 className={`${playfair.className} text-lg font-semibold text-white`}>
            Men
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {menLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-[rgb(20,184,166)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Women */}
        <div>
          <h3 className={`${playfair.className} text-lg font-semibold text-white`}>
            Women
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {womenLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-[rgb(20,184,166)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer care */}
        <div>
          <h3 className={`${playfair.className} text-lg font-semibold text-white`}>
            Customer Care
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {careLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-[rgb(20,184,166)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row sm:text-sm">
          <p>
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>
          <p>Payment: Cash on Delivery / bKash</p>
        </div>
      </div>
    </footer>
  );
}

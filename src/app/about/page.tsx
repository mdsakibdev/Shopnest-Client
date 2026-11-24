import Link from "next/link";
import {
  Banknote,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

// Lucide no longer ships brand icons, so the Facebook and
// Instagram marks are drawn here as tiny inline SVGs (same
// stroke style as the Lucide icons used everywhere else).
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { playfair } from "@/lib/fonts";
import { site } from "@/lib/site";

type ShopSettings = {
  shopName?: string;
  hotline?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
};

// Same settings read as the Footer: live values from the server,
// lib/site values if the server is off — the page never breaks.
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

const menCategories = [
  { label: "Panjabi", href: "/shop?section=men&category=panjabi" },
  { label: "T-shirt", href: "/shop?section=men&category=t-shirt" },
  { label: "Shirt", href: "/shop?section=men&category=shirt" },
  { label: "Polo", href: "/shop?section=men&category=polo" },
  { label: "Pant & Trouser", href: "/shop?section=men&category=pant-and-trouser" },
];

const womenCategories = [
  { label: "Saree", href: "/shop?section=women&category=saree" },
  { label: "Three-Piece", href: "/shop?section=women&category=three-piece" },
  { label: "Kurti", href: "/shop?section=women&category=kurti" },
];

const reasons = [
  {
    icon: Banknote,
    title: "Cash on Delivery",
    text: "Pay at your doorstep when your order arrives — no advance payment needed.",
  },
  {
    icon: Truck,
    title: "Home Delivery",
    text: "We deliver all over Bangladesh, inside and outside Dhaka.",
  },
  {
    icon: RefreshCcw,
    title: "Easy Size Exchange",
    text: "Wrong size? Contact us and we will arrange an exchange.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Checked",
    text: "Every product is checked by hand before it is packed and sent.",
  },
];

export default async function AboutPage() {
  const settings = await readSettings();
  const shopName = settings?.shopName || site.name;
  const hotline = settings?.hotline || site.hotline;
  const email = settings?.email || site.email;
  const address = settings?.address || site.address;
  const facebook = settings?.facebook || "";
  const instagram = settings?.instagram || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>
        About {shopName}
      </h1>
      <p className="mt-3 max-w-3xl leading-relaxed text-zinc-600">
        {shopName} is an online fashion shop for men and women in
        Bangladesh. Our idea is simple: good quality Panjabi, Saree,
        Three-Piece and everyday fashion should be easy to order from
        home — at a fair price, without visiting a crowded market.
      </p>
      <p className="mt-3 max-w-3xl leading-relaxed text-zinc-600">
        Every order is checked and packed by hand before dispatch. You
        can pay with Cash on Delivery or bKash, and you can follow your
        order at any time from the Track My Order page with the Order ID
        you receive at checkout.
      </p>

      {/* What we sell */}
      <h2 className={`${playfair.className} mt-12 text-2xl font-bold`}>
        What We Sell
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className={`${playfair.className} text-xl font-semibold`}>
            For Men
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {menCategories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border px-4 py-1.5 text-sm font-medium hover:border-[rgb(13,148,136)] hover:text-[rgb(15,118,110)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className={`${playfair.className} text-xl font-semibold`}>
            For Women
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {womenCategories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border px-4 py-1.5 text-sm font-medium hover:border-[rgb(13,148,136)] hover:text-[rgb(15,118,110)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Why shop with us */}
      <h2 className={`${playfair.className} mt-12 text-2xl font-bold`}>
        Why Shop With Us
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <div key={reason.title} className="rounded-lg border p-5">
              <Icon className="h-7 w-7 text-[rgb(13,148,136)]" />
              <h3 className="mt-3 font-semibold">{reason.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                {reason.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Contact */}
      <h2 className={`${playfair.className} mt-12 text-2xl font-bold`}>
        Contact Us
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <a
          href={`tel:${hotline}`}
          className="rounded-lg border p-5 hover:border-[rgb(13,148,136)]"
        >
          <Phone className="h-6 w-6 text-[rgb(13,148,136)]" />
          <h3 className="mt-3 font-semibold">Call Us</h3>
          <p className="mt-1 text-sm text-zinc-600">{hotline}</p>
        </a>
        <a
          href={`mailto:${email}`}
          className="rounded-lg border p-5 hover:border-[rgb(13,148,136)]"
        >
          <Mail className="h-6 w-6 text-[rgb(13,148,136)]" />
          <h3 className="mt-3 font-semibold">Email</h3>
          <p className="mt-1 text-sm break-all text-zinc-600">{email}</p>
        </a>
        <div className="rounded-lg border p-5">
          <MapPin className="h-6 w-6 text-[rgb(13,148,136)]" />
          <h3 className="mt-3 font-semibold">Address</h3>
          <p className="mt-1 text-sm text-zinc-600">{address}</p>
        </div>
      </div>

      {(facebook || instagram) && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">Follow us:</p>
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium hover:border-[rgb(13,148,136)] hover:text-[rgb(15,118,110)]"
            >
              <FacebookIcon className="h-4 w-4" /> Facebook
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium hover:border-[rgb(13,148,136)] hover:text-[rgb(15,118,110)]"
            >
              <InstagramIcon className="h-4 w-4" /> Instagram
            </a>
          )}
        </div>
      )}
    </div>
  );
}

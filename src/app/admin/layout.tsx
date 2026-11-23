"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tags,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { playfair } from "@/lib/fonts";

// Admin layout — wraps every /admin page with the admin check and
// the sidebar menu, so each admin page only holds its own content.
const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  if (isPending) {
    return <p className="mx-auto max-w-7xl px-4 py-10">Loading...</p>;
  }

  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className={`${playfair.className} text-3xl font-bold`}>
          Admin only
        </h1>
        <p className="mt-2 text-zinc-600">
          Please login with an admin account to see this page.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block font-medium text-[rgb(13,148,136)] underline"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:flex md:gap-8">
      {/* Sidebar (a row on mobile, a column on desktop) */}
      <aside className="shrink-0 md:w-56">
        <nav className="flex gap-1 overflow-x-auto pb-4 md:flex-col md:overflow-visible md:pb-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  active
                    ? "bg-[rgb(204,251,241)] text-[rgb(15,118,110)]"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-zinc-600 hover:bg-zinc-100"
          >
            <Home className="h-4 w-4" />
            View Store
          </Link>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

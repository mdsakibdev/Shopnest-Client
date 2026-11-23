import ShopContent from "@/components/shop/ShopContent";

// Shop page (Server Component).
// The starting filters come from the address bar — the Navbar, the home
// page category cards and the search box all link here like
// /shop?section=men, /shop?category=saree or /shop?search=panjabi.
// The "key" makes the shop start fresh whenever a new link is clicked.
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
    category?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const section = params.section || "";
  const category = params.category || "";
  const search = params.search || "";

  return (
    <ShopContent
      key={`${section}|${category}|${search}`}
      initialSection={section}
      initialCategory={category}
      initialSearch={search}
    />
  );
}

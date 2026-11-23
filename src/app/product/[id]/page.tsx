import ProductDetails from "@/components/product/ProductDetails";

// Product details page (Server Component) — the address looks like
// /product/64f... and the id is handed to the client component,
// which loads the product, its reviews and related products.
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetails id={id} />;
}

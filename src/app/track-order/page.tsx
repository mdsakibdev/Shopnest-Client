import TrackOrderContent from "@/components/track/TrackOrderContent";

// Track My Order page (Server Component). The success page links
// here with ?id=..., so the order is looked up automatically;
// without an id, the customer pastes their Order ID into the box.
export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id || "";
  return <TrackOrderContent key={id} initialId={id} />;
}

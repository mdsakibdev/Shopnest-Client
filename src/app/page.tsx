import { Banknote, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import HeroSlider from "@/components/home/HeroSlider";
import TopCategories from "@/components/home/TopCategories";
import ProductSection from "@/components/home/ProductSection";
import Reveal from "@/components/Reveal";
import { playfair } from "@/lib/fonts";

// Home page (Server Component) — it only arranges the sections.
// Each section is a Client Component that loads its own data.
export default function HomePage() {
  return (
    <main>
      <HeroSlider />

      <Reveal>
        <TopCategories />
      </Reveal>

      <Reveal>
        <ProductSection
          title="Flash Sale"
          subtitle="Big discounts for a limited time — grab yours before stock runs out"
          tag="Limited Time"
          query="flashSale=true&limit=8"
          viewAllLink="/shop"
          bg="bg-red-50"
        />
      </Reveal>

      <Reveal>
        <ProductSection
          title="Men's Collection"
          subtitle="Panjabi, T-shirt, Shirt, Polo and more for men"
          query="section=men&limit=8"
          viewAllLink="/shop?section=men"
        />
      </Reveal>

      <Reveal>
        <ProductSection
          title="Women's Collection"
          subtitle="Saree, Three-Piece and Kurti for women"
          query="section=women&limit=8"
          viewAllLink="/shop?section=women"
          bg="bg-[rgb(204,251,241)]/40"
        />
      </Reveal>

      <Reveal>
        <ProductSection
          title="New Arrivals"
          subtitle="The newest products in the shop"
          query="limit=8"
          viewAllLink="/shop"
          bg="bg-zinc-50"
        />
      </Reveal>

      {/* Why Shop With Us — simple trust points, no data needed */}
      <Reveal>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2
            className={`${playfair.className} text-center text-3xl font-bold`}
          >
            Why Shop With Us
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
            <div>
              <Banknote className="mx-auto h-10 w-10 text-[rgb(13,148,136)]" />
              <h3 className="mt-3 font-semibold">Cash on Delivery</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Pay at your doorstep when the product arrives.
              </p>
            </div>
            <div>
              <Truck className="mx-auto h-10 w-10 text-[rgb(13,148,136)]" />
              <h3 className="mt-3 font-semibold">Home Delivery</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Fast delivery all over Bangladesh.
              </p>
            </div>
            <div>
              <RefreshCcw className="mx-auto h-10 w-10 text-[rgb(13,148,136)]" />
              <h3 className="mt-3 font-semibold">Easy Exchange</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Wrong size? Easy exchange within 7 days.
              </p>
            </div>
            <div>
              <ShieldCheck className="mx-auto h-10 w-10 text-[rgb(13,148,136)]" />
              <h3 className="mt-3 font-semibold">Quality Checked</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Every product is checked before dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>
      </Reveal>
    </main>
  );
}

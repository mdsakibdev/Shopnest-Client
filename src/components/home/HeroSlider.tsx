"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SERVER_URL } from "@/lib/api";
import { playfair } from "@/lib/fonts";

// The loader lives outside the component, so the effect can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
type BannerSlide = {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
};

async function fetchBanners(): Promise<BannerSlide[]> {
  try {
    const res = await fetch(`${SERVER_URL}/api/banners?active=true`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((b) => ({
      image: b.image,
      title: b.title,
      subtitle: b.subtitle || "",
      buttonText: b.buttonText || "Shop Now",
      link: b.link || "/shop",
    }));
  } catch {
    return [];
  }
}

// Built-in slides. They show until the admin adds banners in
// /admin/banners — and again if the banner list ever comes back empty.
const FALLBACK_SLIDES: BannerSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    title: "New Collection 2026",
    subtitle: "Fresh styles for men and women, quality checked.",
    buttonText: "Shop Now",
    link: "/shop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop",
    title: "Fashion for Men & Women",
    subtitle: "Panjabi, Saree, Three-Piece, Kurti and more.",
    buttonText: "Browse Categories",
    link: "/shop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
    title: "Flash Sale — Up to 40% Off",
    subtitle: "Cash on Delivery available all over Bangladesh.",
    buttonText: "Grab the Offer",
    link: "/shop",
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);

  // Load the admin's banners once. An empty list or a failed
  // request simply keeps the built-in slides.
  useEffect(() => {
    let ignore = false;
    fetchBanners().then((data) => {
      if (!ignore && data.length > 0) {
        setSlides(data);
        setCurrent(0);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Change the slide automatically every 4 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current % slides.length];

  return (
    <section className="relative h-80 w-full overflow-hidden md:h-110">
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover"
      />
      {/* Dark overlay so the text is easy to read */}
      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1
            className={`${playfair.className} max-w-xl text-3xl font-bold text-white md:text-5xl`}
          >
            {slide.title}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-zinc-200 md:text-lg">
            {slide.subtitle}
          </p>
          <Link
            href={slide.link}
            className="mt-6 inline-block rounded-md bg-[rgb(13,148,136)] px-6 py-3 font-semibold text-white hover:bg-[rgb(15,118,110)]"
          >
            {slide.buttonText}
          </Link>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${
              i === current ? "bg-[rgb(13,148,136)]" : "bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

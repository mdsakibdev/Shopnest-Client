import type { Metadata } from "next";
import "./globals.css";
import { manrope } from "@/lib/fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.name,
  description: "Fashion for men and women — Panjabi, Saree, Three-Piece and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} bg-white text-zinc-900 antialiased`}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

import { Playfair_Display, Manrope } from "next/font/google";

// Headings + logo
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Body text, buttons, prices — everything else
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

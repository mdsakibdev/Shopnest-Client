# ShopNest — Client

A single-vendor fashion eCommerce storefront for men and women, built to sell to Bangladeshi shop owners. One shop, one owner (admin), many happy customers.

**Live demo:** https://shopnest-client-fghr.vercel.app
**Server (API):** https://shopnest-server-fghr.vercel.app

## What customers can do

- Browse 40 products across 8 sub-categories — Panjabi, T-shirt, Shirt, Polo, Pant & Trouser (Men) and Saree, Three-Piece, Kurti (Women)
- Search, filter by sub-category, sort by price, paginate on the Shop page
- Product details with image gallery, size + colour selector, stock status, quantity and reviews
- Cart drawer (saved in the browser, works for guests too) and guest checkout — no account forced
- Pay by **Cash on Delivery** or **bKash manual** (customer sends money, enters TrxID + sender number)
- Track an order with order id + phone number, or from My Account after login
- Register / login with email + password (register = customer only)

## What the admin can do

- Dashboard with today's orders, revenue, pending orders, products and low-stock alerts
- Products and categories CRUD (images via ImgBB, sizes, colours, stock, featured, flash sale)
- Orders: Pending → Confirmed → Shipped → Delivered (or Cancelled), verify bKash TrxID and mark payment verified
- Banners, reviews moderation, customers list
- **Settings — the rebranding page:** shop name, logo, hotline, bKash number, delivery charges, social links. Change these and the shop becomes the client's shop.

## Tech stack

- Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui
- BetterAuth (lives in the client, MongoDB adapter) — login / session, JWT verified by the server
- Fonts: Playfair Display (headings + logo) + Manrope (body, buttons, prices)
- Colours: white base, black / charcoal text, Teal accent `#0D9488` (hover `#0F766E`, light `#CCFBF1`) — light mode only in v1

## Project structure

```
src/
  app/            pages: home, shop, product/[id], checkout, track-order,
                  my-account, about, login, register, admin/*
  components/     layout (Navbar, Footer), product, cart, ui (shadcn)
  context/        CartContext — cart state + localStorage
  lib/            auth.ts (BetterAuth), api helpers
```

## Run locally

```bash
cd shopnest-client
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Create `shopnest-client/.env.local` (values are yours — never commit this file):

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | Server URL — `http://localhost:5000` locally, the Vercel server URL in production |
| `MONGODB_URI` | MongoDB Atlas connection string (BetterAuth adapter) |
| `BETTER_AUTH_SECRET` | Secret for BetterAuth sessions |
| `BETTER_AUTH_URL` | `http://localhost:3000` locally, the Vercel client URL in production |

## Deployment

- Vercel, project `shopnest-client-fghr`. Deployment Protection is OFF — route-level JWT is the real guard.
- Function Region is **Mumbai (bom1)**, so the serverless functions sit close to the Atlas cluster.
- After changing env vars in the Vercel dashboard, redeploy — pasting values in the dashboard editor is unreliable; the Vercel CLI (`vercel env rm` / `vercel env add`) is the reliable route.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | _(fill in after creating)_ | _(fill in after creating)_ |
| Customer | _(fill in after creating)_ | _(fill in after creating)_ |

How to create them:

1. **Customer** — open the live site, go to Register and create an account. That is all.
2. **Admin** — there is no admin signup. Create the user in MongoDB directly (the `users` collection) with `role: "admin"`, the same way the first admin was created. Then change the password after handover.

## Selling it to a client

1. Settings: change shop name, logo, hotline, bKash number, delivery charges
2. Replace the demo products with the client's real products
3. Change the admin password
4. Connect the client's own domain (optional)
5. Hand over the admin login + this README

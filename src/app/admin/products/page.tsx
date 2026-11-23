"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { SERVER_URL, getToken } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  section: string;
  images: string[];
  sizes: string[];
  colours: string[];
  stock: number;
  featured: boolean;
  flashSale: boolean;
  sold: number;
};

// Category choices for the dropdown — same fixed list as the plan.
// The admin picks from the list, so there are no spelling mistakes.
const menCategories = [
  { label: "Panjabi", slug: "panjabi" },
  { label: "T-shirt", slug: "t-shirt" },
  { label: "Shirt", slug: "shirt" },
  { label: "Polo", slug: "polo" },
  { label: "Pant & Trouser", slug: "pant-trouser" },
];
const womenCategories = [
  { label: "Saree", slug: "saree" },
  { label: "Three-Piece", slug: "three-piece" },
  { label: "Kurti", slug: "kurti" },
];

// Load the product list from the server.
// Kept outside the component, so the effect below can set state
// inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${SERVER_URL}/api/products?limit=100`);
  const data = await res.json();
  return data.products || [];
}

export default function AdminProductsPage() {
  const { data: session, isPending } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [section, setSection] = useState("men");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("");
  const [colours, setColours] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [flashSale, setFlashSale] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Used after add / edit / delete (button clicks — not an effect)
  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  useEffect(() => {
    let ignore = false;
    fetchProducts().then((data) => {
      if (!ignore) setProducts(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setDiscountPrice("");
    setStock("");
    setSizes("");
    setColours("");
    setImage("");
    setDescription("");
    setFeatured(false);
    setFlashSale(false);
    setEditingId("");
  };

  // Upload one image to ImgBB and keep its link in the image field.
  // Needs NEXT_PUBLIC_IMGBB_API_KEY in .env.local (MD's own key).
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success) {
        setImage(data.data.url);
      } else {
        setError("Image upload failed. Check the ImgBB key or paste a link.");
      }
    } catch {
      setError("Image upload failed. Check your connection.");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const token = await getToken();
    const url = editingId
      ? `${SERVER_URL}/api/products/${editingId}`
      : `${SERVER_URL}/api/products`;

    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        section,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock) || 0,
        sizes,
        colours,
        images: image ? [image] : [],
        description,
        featured,
        flashSale,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      return;
    }
    setMessage(editingId ? "Product updated." : "Product added.");
    resetForm();
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setName(product.name);
    setSection(product.section);
    setCategory(product.category);
    setPrice(String(product.price));
    setDiscountPrice(product.discountPrice ? String(product.discountPrice) : "");
    setStock(String(product.stock));
    setSizes(product.sizes.join(", "));
    setColours(product.colours.join(", "));
    setImage(product.images[0] || "");
    setDescription(product.description || "");
    setFeatured(product.featured);
    setFlashSale(product.flashSale);
    setEditingId(product._id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const token = await getToken();
    const res = await fetch(`${SERVER_URL}/api/products/${deleteTarget._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setDeleting(false);
    setDeleteTarget(null);

    if (res.ok) {
      setMessage("Product deleted.");
      loadProducts();
    } else {
      const data = await res.json();
      setError(data.message || "Delete failed");
    }
  };

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

  const categoryOptions = section === "men" ? menCategories : womenCategories;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>Products</h1>
      <p className="mt-2 text-zinc-600">Total: {products.length} products</p>

      {/* Add / edit form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-lg border p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              placeholder="e.g. Premium Cotton Panjabi - Red"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Section</Label>
            <div className="flex rounded-md border p-1">
              <button
                type="button"
                onClick={() => {
                  setSection("men");
                  setCategory("");
                }}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-medium ${
                  section === "men"
                    ? "bg-[rgb(13,148,136)] text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Men
              </button>
              <button
                type="button"
                onClick={() => {
                  setSection("women");
                  setCategory("");
                }}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-medium ${
                  section === "women"
                    ? "bg-[rgb(13,148,136)] text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Women
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="" disabled>
                Select category
              </option>
              {categoryOptions.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (৳)</Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g. 2450"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountPrice">Discount price (৳, optional)</Label>
            <Input
              id="discountPrice"
              type="number"
              placeholder="e.g. 1950"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              placeholder="e.g. 25"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizes">Sizes (comma separated)</Label>
            <Input
              id="sizes"
              placeholder="M, L, XL, XXL"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="colours">Colours (comma separated)</Label>
            <Input
              id="colours"
              placeholder="Black, White"
              value={colours}
              onChange={(e) => setColours(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="image">Image link</Label>
            <Input
              id="image"
              placeholder="Paste an image link, or upload below"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {uploading && (
              <p className="text-sm text-zinc-500">Uploading image...</p>
            )}
            {image && (
              <Image
                src={image}
                alt="Product preview"
                width={120}
                height={120}
                className="rounded-md border object-cover"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Short description of the product"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={flashSale}
              onChange={(e) => setFlashSale(e.target.checked)}
              className="h-4 w-4"
            />
            Flash Sale
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
            >
              {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Product list */}
      <div className="mt-8 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Sold</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded-md border object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="flex gap-1 text-xs">
                        {product.featured && (
                          <span className="rounded-full bg-[rgb(204,251,241)] px-2 py-0.5 font-semibold text-[rgb(15,118,110)]">
                            Featured
                          </span>
                        )}
                        {product.flashSale && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-600">
                            Flash Sale
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {product.category} ({product.section})
                </td>
                <td className="px-4 py-3">
                  {product.discountPrice ? (
                    <>
                      <span className="font-semibold">
                        ৳{product.discountPrice}
                      </span>{" "}
                      <span className="text-zinc-400 line-through">
                        ৳{product.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">৳{product.price}</span>
                  )}
                </td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{product.sold}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr className="border-t">
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal — same pattern as FixMate */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold">Delete this product?</h2>
            <p className="mt-2 text-sm text-zinc-600">
              &ldquo;{deleteTarget.name}&rdquo; will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

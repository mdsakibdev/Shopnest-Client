"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { SERVER_URL, getToken } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = {
  _id: string;
  name: string;
  slug: string;
  section: string;
  image: string;
  order: number;
};

// The shop has a fixed set of category names (from the plan).
// The admin picks a name from the dropdown — no typing, no spelling mistakes.
const menCategoryNames = ["Panjabi", "T-shirt", "Shirt", "Polo", "Pant & Trouser"];
const womenCategoryNames = ["Saree", "Three-Piece", "Kurti"];

// Load the category list from the server.
// Kept outside the component, so the effect below can call it
// and set state inside .then() — the React lint rule in Next 16
// does not allow calling setState directly inside an effect.
async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${SERVER_URL}/api/categories`);
  return res.json();
}

export default function AdminCategoriesPage() {
  const { data: session, isPending } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [section, setSection] = useState("men");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Used after add / edit / delete (button clicks — not an effect)
  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  useEffect(() => {
    let ignore = false;
    fetchCategories().then((data) => {
      if (!ignore) setCategories(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setName("");
    setSection("men");
    setImage("");
    setEditingId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const token = await getToken();
    const url = editingId
      ? `${SERVER_URL}/api/categories/${editingId}`
      : `${SERVER_URL}/api/categories`;

    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, section, image }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      return;
    }
    setMessage(editingId ? "Category updated." : "Category added.");
    resetForm();
    loadCategories();
  };

  // Shortcut: add all 8 default categories with one click.
  // Categories that already exist are skipped by the server.
  const handleAddAll = async () => {
    setMessage("");
    setError("");
    setAddingAll(true);

    const token = await getToken();
    const all = [
      ...menCategoryNames.map((name) => ({ name, section: "men" })),
      ...womenCategoryNames.map((name) => ({ name, section: "women" })),
    ];

    for (const item of all) {
      await fetch(`${SERVER_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...item, image: "" }),
      });
    }

    setAddingAll(false);
    setMessage("All default categories added (existing ones were skipped).");
    loadCategories();
  };

  const handleEdit = (category: Category) => {
    setName(category.name);
    setSection(category.section);
    setImage(category.image || "");
    setEditingId(category._id);
    setMessage("");
    setError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const token = await getToken();
    const res = await fetch(
      `${SERVER_URL}/api/categories/${deleteTarget._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setDeleting(false);
    setDeleteTarget(null);

    if (res.ok) {
      setMessage("Category deleted.");
      loadCategories();
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className={`${playfair.className} text-3xl font-bold`}>
        Categories
      </h1>
      <p className="mt-2 text-zinc-600">
        Total: {categories.length} — Men:{" "}
        {categories.filter((c) => c.section === "men").length}, Women:{" "}
        {categories.filter((c) => c.section === "women").length}
      </p>

      <Button
        type="button"
        onClick={handleAddAll}
        disabled={addingAll}
        variant="outline"
        className="mt-4 border-[rgb(13,148,136)] text-[rgb(15,118,110)] hover:bg-[rgb(204,251,241)]"
      >
        {addingAll ? "Adding..." : "Add All 8 Default Categories (Shortcut)"}
      </Button>

      {/* Add / edit form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 rounded-lg border p-5 sm:grid-cols-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Category name</Label>
          <select
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="" disabled>
              Select category
            </option>
            {(section === "men" ? menCategoryNames : womenCategoryNames).map(
              (categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              )
            )}
            {name &&
              !menCategoryNames.includes(name) &&
              !womenCategoryNames.includes(name) && (
                <option value={name}>{name}</option>
              )}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Section</Label>
          <div className="flex rounded-md border p-1">
            <button
              type="button"
              onClick={() => { setSection("men"); setName(""); }}
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
              onClick={() => { setSection("women"); setName(""); }}
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
          <Label htmlFor="image">Image URL (optional)</Label>
          <Input
            id="image"
            placeholder="ImgBB image link"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add Category"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Category list */}
      <div className="mt-8 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Section</th>
              <th className="px-4 py-3 font-semibold">Image</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="border-t">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-zinc-500">{category.slug}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[rgb(204,251,241)] px-2.5 py-1 text-xs font-semibold text-[rgb(15,118,110)]">
                    {category.section}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {category.image ? "Yes" : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(category)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr className="border-t">
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No categories yet. Add the first one from the form above.
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
            <h2 className="text-lg font-semibold">Delete this category?</h2>
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

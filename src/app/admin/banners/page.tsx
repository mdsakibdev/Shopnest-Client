"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SERVER_URL, getToken } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Banner = {
  _id: string;
  title: string;
  image: string;
  subtitle: string;
  buttonText: string;
  link: string;
  order: number;
  active: boolean;
};

// The loader lives outside the component, so the effect can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${SERVER_URL}/api/banners`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const emptyForm = {
  title: "",
  image: "",
  subtitle: "",
  buttonText: "Shop Now",
  link: "/shop",
  order: "",
  active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // The banner waiting for delete confirmation (FixMate-style modal)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchBanners().then((data) => {
      if (!ignore) {
        setBanners(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const reload = () => {
    fetchBanners().then((data) => setBanners(data));
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title,
      image: banner.image,
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "Shop Now",
      link: banner.link || "/shop",
      order: String(banner.order ?? ""),
      active: banner.active !== false,
    });
    setMessage("");
  };

  const handleCancel = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const token = await getToken();
    const url = editingId
      ? `${SERVER_URL}/api/banners/${editingId}`
      : `${SERVER_URL}/api/banners`;
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: form.title,
        image: form.image,
        subtitle: form.subtitle,
        buttonText: form.buttonText,
        link: form.link,
        order: form.order === "" ? undefined : Number(form.order),
        active: form.active,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.message || "Could not save the banner");
      return;
    }
    setMessage(editingId ? "Banner updated." : "Banner added.");
    handleCancel();
    reload();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = await getToken();
    const res = await fetch(
      `${SERVER_URL}/api/banners/${deleteTarget._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setDeleting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      setMessage("Could not delete the banner. Please try again.");
      return;
    }
    setBanners((prev) => prev.filter((b) => b._id !== deleteTarget._id));
    setMessage("Banner deleted.");
  };

  return (
    <div>
      <h1 className={`${playfair.className} text-3xl font-bold`}>Banners</h1>
      <p className="mt-1 text-zinc-600">
        {banners.length} banners · only the active ones show on the home
        page slider, in order number.
      </p>

      {/* Add / edit form */}
      <form
        onSubmit={handleSave}
        className="mt-6 space-y-4 rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Banner" : "Add Banner"}
        </h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. New Collection 2026"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            placeholder="ImgBB or Pexels image link"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            placeholder="e.g. Fresh styles for men and women"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={form.buttonText}
              onChange={(e) =>
                setForm({ ...form, buttonText: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Button Link</Label>
            <Input
              id="link"
              placeholder="/shop"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              min="1"
              placeholder="1"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 accent-[rgb(13,148,136)]"
          />
          Show on home page
        </label>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
          >
            {saving ? "Saving..." : editingId ? "Update Banner" : "Add Banner"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </form>

      {/* Banner list */}
      {loading ? (
        <p className="mt-6 text-zinc-600">Loading...</p>
      ) : banners.length === 0 ? (
        <p className="mt-6 text-zinc-600">
          No banners yet. Add one above — until then the home page keeps
          showing its built-in slides.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              {/* Banner links are pasted by the admin from any source,
                  so a plain <img> is used on purpose (see Navbar logo). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image}
                alt={banner.title}
                className="h-14 w-24 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{banner.title}</p>
                <p className="truncate text-sm text-zinc-500">
                  {banner.subtitle || "—"} · Order {banner.order}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                  banner.active
                    ? "bg-[rgb(204,251,241)] text-[rgb(15,118,110)]"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {banner.active ? "Active" : "Hidden"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(banner)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(banner)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation — FixMate-style modal, no window.confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold">Delete banner?</h2>
            <p className="mt-2 text-sm text-zinc-600">
              “{deleteTarget.title}” will be removed from the home page
              slider.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700"
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

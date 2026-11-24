"use client";

import { useEffect, useState } from "react";
import { SERVER_URL, getToken } from "@/lib/api";
import { playfair } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ShopSettings = {
  shopName: string;
  logo: string;
  hotline: string;
  email: string;
  address: string;
  bkashNumber: string;
  deliveryInside: number;
  deliveryOutside: number;
  facebook: string;
  instagram: string;
};

// The loader lives outside the component, so the effect can set
// state inside .then() — the pattern the Next 16 lint rule accepts.
async function fetchSettings(): Promise<ShopSettings | null> {
  try {
    const res = await fetch(`${SERVER_URL}/api/settings`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const emptyForm: ShopSettings = {
  shopName: "",
  logo: "",
  hotline: "",
  email: "",
  address: "",
  bkashNumber: "",
  deliveryInside: 60,
  deliveryOutside: 120,
  facebook: "",
  instagram: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<ShopSettings>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    fetchSettings().then((data) => {
      if (!ignore) {
        if (data) setForm(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const token = await getToken();
    const res = await fetch(`${SERVER_URL}/api/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.message || "Could not save settings");
      return;
    }
    setForm(data);
    setMessage(
      "Settings saved. The new shop name, hotline and delivery charges show on the store right away."
    );
  };

  if (loading) {
    return <p className="text-zinc-600">Loading...</p>;
  }

  return (
    <div>
      <h1 className={`${playfair.className} text-3xl font-bold`}>Settings</h1>
      <p className="mt-1 text-zinc-600">
        Change these once per client and the whole shop follows — no code
        changes needed.
      </p>

      <form
        onSubmit={handleSave}
        className="mt-6 max-w-2xl space-y-4 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop Name</Label>
          <Input
            id="shopName"
            value={form.shopName}
            onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo Image URL (optional)</Label>
          <Input
            id="logo"
            placeholder="ImgBB image link — shows in the Navbar"
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hotline">Hotline</Label>
            <Input
              id="hotline"
              placeholder="e.g. 01800-000000"
              value={form.hotline}
              onChange={(e) => setForm({ ...form, hotline: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bkashNumber">bKash Number (shop&apos;s)</Label>
          <Input
            id="bkashNumber"
            placeholder="e.g. 01700-000000"
            value={form.bkashNumber}
            onChange={(e) =>
              setForm({ ...form, bkashNumber: e.target.value })
            }
          />
          <p className="text-xs text-zinc-500">
            Customers send money to this number at checkout.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deliveryInside">Delivery — Inside Dhaka (৳)</Label>
            <Input
              id="deliveryInside"
              type="number"
              min="0"
              value={form.deliveryInside}
              onChange={(e) =>
                setForm({
                  ...form,
                  deliveryInside: Number(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryOutside">
              Delivery — Outside Dhaka (৳)
            </Label>
            <Input
              id="deliveryOutside"
              type="number"
              min="0"
              value={form.deliveryOutside}
              onChange={(e) =>
                setForm({
                  ...form,
                  deliveryOutside: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook Page URL (optional)</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/..."
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL (optional)</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/..."
              value={form.instagram}
              onChange={(e) =>
                setForm({ ...form, instagram: e.target.value })
              }
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-[rgb(13,148,136)] text-white hover:bg-[rgb(15,118,110)]"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </form>
    </div>
  );
}

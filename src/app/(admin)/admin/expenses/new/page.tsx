"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createExpense } from "@/lib/actions/expense-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const categories = [
  { value: "listrik", label: "Listrik" },
  { value: "air", label: "Air" },
  { value: "kebersihan", label: "Kebersihan" },
  { value: "perbaikan", label: "Perbaikan" },
  { value: "gaji", label: "Gaji" },
  { value: "internet", label: "Internet" },
  { value: "keamanan", label: "Keamanan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("listrik");
  const [customCat, setCustomCat] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    if (!fd.get("description") || !fd.get("amount") || !fd.get("date")) {
      toast.error("Lengkapi field wajib");
      setLoading(false);
      return;
    }
    fd.set("custom_category", category === "lainnya" ? customCat : "");

    const result = await createExpense(fd);
    if (result.success) {
      toast.success("Pengeluaran dicatat");
      router.push("/admin/expenses");
      router.refresh();
    } else {
      toast.error(result.error || "Gagal menyimpan");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Catat Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category === "lainnya" && (
                <Input
                  name="custom_category"
                  placeholder="Nama kategori..."
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Input name="description" placeholder="Misal: Token listrik 100kWh" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah</label>
              <Input name="amount" type="number" placeholder="50000" required min="1000" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal</label>
              <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan (opsional)</label>
              <Textarea name="notes" rows={2} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

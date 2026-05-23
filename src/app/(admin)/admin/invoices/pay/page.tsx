"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/lib/actions/invoice-actions";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function PayInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/invoices/unpaid");
      const data = await res.json();
      setInvoices(data);
      setFetching(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selected) setAmount(String(selected.total_amount));
  }, [selected]);

  const handleSubmit = async () => {
    if (!selected || !amount) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("invoice_id", selected.id);
    fd.set("payment_method", method);
    fd.set("amount", amount);
    fd.set("payment_date", date);
    fd.set("notes", notes);

    const result = await recordPayment(null, fd);
    if (result?.success) {
      toast.success("Pembayaran berhasil dicatat");
      router.push("/admin/invoices");
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Catat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih Invoice</label>
            <Select
              value={selected?.id || ""}
              onValueChange={(v) => setSelected(invoices.find((i) => i.id === v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih invoice..." />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoice_number} — Rp {inv.total_amount.toLocaleString("id-ID")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <>
              <div className="p-3 rounded-lg bg-muted/30 text-sm space-y-1">
                <p>Invoice: <strong>{selected.invoice_number}</strong></p>
                <p>Tagihan: Rp {selected.amount.toLocaleString("id-ID")}</p>
                <p>Denda: Rp {selected.fine_amount.toLocaleString("id-ID")}</p>
                <p className="font-medium">Total: Rp {selected.total_amount.toLocaleString("id-ID")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metode Bayar</label>
                <Select value={method} onValueChange={(v) => v && setMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="midtrans">Midtrans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah</label>
                <Input type="number" value={amount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v <= selected.total_amount) setAmount(e.target.value);
                  }}
                />
                {parseInt(amount) < selected.total_amount && (
                  <p className="text-xs text-amber-600">Jumlah kurang dari total tagihan (pembayaran sebagian)</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Bayar</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => router.back()}>Batal</Button>
                <Button onClick={handleSubmit} disabled={loading || !amount}>
                  {loading ? "Memproses..." : "Konfirmasi Bayar"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

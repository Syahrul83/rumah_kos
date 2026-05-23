"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/lib/actions/contract-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, User, Home, FileText } from "lucide-react";
import { toast } from "sonner";

export default function NewContractPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Tenant selection
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");
  const [fetchingTenants, setFetchingTenants] = useState(true);

  // Step 2: Room selection
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [fetchingRooms, setFetchingRooms] = useState(true);

  // Step 3: Details
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("3");
  const [monthlyPrice, setMonthlyPrice] = useState("500000");
  const [deposit, setDeposit] = useState("500000");
  const [createInvoice, setCreateInvoice] = useState(true);

  useEffect(() => {
    async function loadTenants() {
      const res = await fetch("/api/tenants/eligible?" + new URLSearchParams({ search: tenantSearch }));
      const data = await res.json();
      setTenants(data);
      setFetchingTenants(false);
    }
    loadTenants();
  }, [tenantSearch]);

  useEffect(() => {
    async function loadRooms() {
      const res = await fetch("/api/rooms/available");
      const data = await res.json();
      setRooms(data);
      setFetchingRooms(false);
      if (data.length > 0 && !selectedRoom) setSelectedRoom(data[0].id);
    }
    loadRooms();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set("tenant_id", selectedTenant);
    fd.set("room_id", selectedRoom);
    fd.set("start_date", startDate);
    fd.set("duration_months", duration);
    fd.set("monthly_price", monthlyPrice);
    fd.set("deposit", deposit);
    fd.set("create_invoice", String(createInvoice));

    const result = await createContract(null, fd);
    if (result?.success) {
      toast.success("Kontrak berhasil dibuat");
      router.push("/admin/contracts");
      router.refresh();
    } else if (result?.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const selectedTenantData = tenants.find((t) => t.id === selectedTenant);
  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + parseInt(duration));

  const steps = [
    { num: 1, label: "Pilih Penyewa", icon: User },
    { num: 2, label: "Pilih Kamar", icon: Home },
    { num: 3, label: "Konfirmasi", icon: FileText },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="h-0.5 flex-1 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Step 1: Tenant */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Pilih Penyewa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Cari nama penyewa..."
              value={tenantSearch}
              onChange={(e) => setTenantSearch(e.target.value)}
            />
            {fetchingTenants ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : tenants.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Tidak ada penyewa. <a href="/admin/tenants/new" className="text-primary underline">Tambah penyewa dulu</a>
              </p>
            ) : (
              <div className="space-y-2">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTenant(t.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTenant === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium">{t.full_name}</p>
                    <p className="text-sm text-muted-foreground">{t.phone}</p>
                    {t.is_blacklisted && (
                      <p className="text-xs text-destructive mt-1">Diblokir</p>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button onClick={() => setStep(2)} disabled={!selectedTenant}>
                Lanjut
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Room */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" /> Pilih Kamar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fetchingRooms ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Tidak ada kamar tersedia.</p>
            ) : (
              <div className="space-y-2">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoom(r.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRoom === r.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.name} — Lantai {r.floor}</p>
                      <span className="text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded">Tersedia</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      Rp {r.price.toLocaleString("id-ID")}
                      <span className="text-sm font-normal text-muted-foreground">/bulan</span>
                    </p>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Kembali</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedRoom}>Lanjut</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Konfirmasi Kontrak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Penyewa: <strong>{selectedTenantData?.full_name || "-"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Kamar: <strong>{selectedRoomData?.name || "-"}</strong> (Lt. {selectedRoomData?.floor})</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tanggal Masuk</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Durasi</label>
                <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bulan</SelectItem>
                    <SelectItem value="3">3 Bulan</SelectItem>
                    <SelectItem value="6">6 Bulan</SelectItem>
                    <SelectItem value="12">1 Tahun</SelectItem>
                    <SelectItem value="24">2 Tahun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Harga / Bulan</label>
                <Input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Deposit</label>
                <Input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createInvoice"
                  checked={createInvoice}
                  onChange={(e) => setCreateInvoice(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="createInvoice" className="text-sm">
                  Buat invoice bulan pertama
                </label>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium">Ringkasan</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <span className="text-muted-foreground">Mulai:</span>
                <span>{startDate}</span>
                <span className="text-muted-foreground">Selesai:</span>
                <span>{endDate.toISOString().split("T")[0]}</span>
                <span className="text-muted-foreground">Harga/Bulan:</span>
                <span>Rp {parseInt(monthlyPrice).toLocaleString("id-ID")}</span>
                <span className="text-muted-foreground">Deposit:</span>
                <span>Rp {parseInt(deposit).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Kembali</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Menyimpan..." : <><Check className="h-4 w-4 mr-2" /> Simpan Kontrak</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

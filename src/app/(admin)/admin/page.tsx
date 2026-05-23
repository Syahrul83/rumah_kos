import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Users, CreditCard, AlertTriangle, Plus, FileText, Package } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createSupabase();

  const { count: totalRooms } = await supabase.from("rooms").select("*", { count: "exact", head: true });
  const { data: roomsByStatus } = await supabase.from("rooms").select("status");
  const { count: totalTenants } = await supabase.from("tenants").select("*", { count: "exact", head: true });
  const { count: activeTenants } = await supabase.from("tenants").select("*", { count: "exact", head: true }).eq("status", "aktif");

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const { data: monthlyIncome } = await supabase.from("payments").select("amount").eq("status", "settlement").gte("payment_date", firstOfMonth);
  const monthlyTotal = monthlyIncome?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

  const { count: overdueCount } = await supabase.from("invoices").select("*", { count: "exact", head: true }).eq("status", "overdue");
  const { data: overdueTotal } = await supabase.from("invoices").select("total_amount").eq("status", "overdue");
  const overdueSum = overdueTotal?.reduce((sum, i) => sum + (i.total_amount || 0), 0) ?? 0;

  const tersedia = roomsByStatus?.filter((r) => r.status === "tersedia").length ?? 0;
  const terisi = roomsByStatus?.filter((r) => r.status === "terisi").length ?? 0;
  const perbaikan = roomsByStatus?.filter((r) => r.status === "perbaikan").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/tenants/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Penyewa
        </Link>
        <Link
          href="/admin/contracts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Buat Kontrak
        </Link>
        <Link
          href="/admin/invoices/pay"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Catat Pembayaran
        </Link>
        <Link
          href="/admin/expenses/new"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <Package className="h-4 w-4" />
          Tambah Pengeluaran
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kamar</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRooms}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                {tersedia} Tersedia
              </Badge>
              <Badge variant="outline" className="text-secondary bg-secondary/5 border-secondary/30">
                {terisi} Terisi
              </Badge>
              {perbaikan > 0 && (
                <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                  {perbaikan} Rusak
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Penghuni</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTenants}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                {activeTenants} Aktif
              </Badge>
              <Badge variant="outline" className="text-muted-foreground bg-muted/50 border-border">
                {totalTenants !== null && activeTenants !== null ? totalTenants - activeTenants : 0} Tidak
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendapatan Bulan Ini</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {monthlyTotal.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Per {today.toLocaleDateString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Rp {overdueSum.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent alerts */}
      {overdueCount !== null && overdueCount > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Perlu Tindakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ada {overdueCount} tagihan overdue dengan total Rp {overdueSum.toLocaleString("id-ID")}.
              Segera lakukan penagihan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

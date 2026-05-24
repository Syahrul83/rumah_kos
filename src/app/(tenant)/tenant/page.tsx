import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Home, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";

export default async function TenantDashboard() {
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6">Silakan login.</p>;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, rooms(name, price)")
    .eq("user_id", user.id)
    .single();

  const { data: unpaidInvoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", tenant?.id)
    .in("status", ["unpaid", "overdue"])
    .order("due_date", { ascending: true })
    .limit(1);

  const { data: recentPayments } = await supabase
    .from("payments")
    .select("*, invoices(invoice_number, period_start)")
    .eq("tenant_id", tenant?.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const unpaidCount = unpaidInvoices?.length || 0;
  const nextInvoice = unpaidInvoices?.[0];

  return (
    <div className="p-4 space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold">Halo, {tenant?.full_name?.split(" ")[0] || "Penghuni"}</h1>
        <p className="text-muted-foreground text-sm">
          {tenant ? `${((tenant as any).rooms as any)?.name || "Kamar"} • ${tenant.status === "aktif" ? "Aktif" : "Tidak Aktif"}` : "Data tidak ditemukan"}
        </p>
      </div>

      {/* Urgent: Unpaid invoice */}
      {nextInvoice && (
        <Card className={`border-2 ${nextInvoice.status === "overdue" ? "border-destructive" : "border-amber-300"}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium">
                  {nextInvoice.status === "overdue" ? "🔴 TAGIHAN JATUH TEMPO" : "💳 TAGIHAN BULAN INI"}
                </p>
                <p className="text-2xl font-bold mt-1">
                  Rp {nextInvoice.total_amount.toLocaleString("id-ID")}
                </p>
                {nextInvoice.fine_amount > 0 && (
                  <p className="text-xs text-destructive">
                    termasuk denda Rp {nextInvoice.fine_amount.toLocaleString("id-ID")}
                  </p>
                )}
              </div>
              <StatusBadge type="invoice" status={nextInvoice.status} />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Jatuh tempo: <strong>{nextInvoice.due_date}</strong>
            </p>
            <Link href="/tenant/invoices">
              <Button className={`w-full ${nextInvoice.status === "overdue" ? "bg-destructive hover:bg-destructive/90" : "bg-primary"}`}>
                <CreditCard className="h-4 w-4 mr-2" />
                Bayar Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Room + Contract cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <Home className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">{(tenant as any)?.rooms?.name || "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Rp {(tenant as any)?.rooms?.price?.toLocaleString("id-ID") || 0}/bulan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <FileText className="h-5 w-5 text-secondary mb-2" />
            <p className="font-medium text-sm">Kontrak</p>
            <p className="text-xs text-muted-foreground mt-1">{tenant?.status === "aktif" ? "Aktif" : "Tidak Aktif"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Pembayaran Terakhir</h3>
          <Link href="/tenant/payments" className="text-xs text-primary">Lihat Semua</Link>
        </div>
        {recentPayments && recentPayments.length > 0 ? (
          <div className="space-y-2">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div>
                  <p className="text-sm font-medium">Rp {p.amount.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground">{p.payment_method} • {(p as any).invoices?.period_start}</p>
                </div>
                <StatusBadge type="payment" status={p.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada pembayaran.</p>
        )}
      </div>
    </div>
  );
}

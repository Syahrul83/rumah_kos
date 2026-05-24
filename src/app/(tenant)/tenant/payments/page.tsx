import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";

export default async function TenantPayments() {
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-4">Silakan login.</p>;

  const { data: tenant } = await supabase.from("tenants").select("id").eq("user_id", user.id).single();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoices(invoice_number, period_start)")
    .eq("tenant_id", tenant?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Riwayat Pembayaran</h1>

      {payments && payments.length > 0 ? (
        <div className="space-y-2">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Rp {p.amount.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.payment_method} • {p.payment_date} • {(p as any).invoices?.period_start || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(p as any).invoices?.invoice_number || "-"}
                  </p>
                </div>
                <StatusBadge type="payment" status={p.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Belum ada riwayat pembayaran.</p>
      )}
    </div>
  );
}

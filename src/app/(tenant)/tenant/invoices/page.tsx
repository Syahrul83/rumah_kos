import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import MidtransSnapButton from "@/components/payment/midtrans-snap-button";

export default async function TenantInvoices() {
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-4">Silakan login.</p>;

  const { data: tenant } = await supabase.from("tenants").select("id").eq("user_id", user.id).single();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", tenant?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Tagihan Saya</h1>

      {invoices && invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id} className={inv.status === "overdue" ? "border-destructive" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{inv.period_start} — {inv.period_end}</p>
                    <p className="text-xs text-muted-foreground">{inv.invoice_number}</p>
                  </div>
                  <StatusBadge type="invoice" status={inv.status} />
                </div>
                <p className="text-lg font-bold mb-1">
                  Rp {inv.total_amount.toLocaleString("id-ID")}
                </p>
                {inv.fine_amount > 0 && (
                  <p className="text-xs text-destructive mb-2">Denda: Rp {inv.fine_amount.toLocaleString("id-ID")}</p>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  Jatuh tempo: <strong>{inv.due_date}</strong>
                </p>
                {(inv.status === "unpaid" || inv.status === "overdue") && (
                  <MidtransSnapButton
                    invoiceId={inv.id}
                    amount={inv.total_amount}
                    invoiceNumber={inv.invoice_number}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Belum ada tagihan.</p>
      )}
    </div>
  );
}

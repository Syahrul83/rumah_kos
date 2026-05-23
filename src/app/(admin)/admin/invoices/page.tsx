import Link from "next/link";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";

interface InvoicesPageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10;

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const filterStatus = params.status || "";
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const supabase = await createSupabase();

  let query = supabase
    .from("invoices")
    .select("*, tenants!invoices_tenant_id_fkey(full_name), rental_contracts!invoices_contract_id_fkey(rooms(name))", { count: "exact" });

  if (filterStatus) query = query.eq("status", filterStatus);
  if (search) query = query.ilike("invoice_number", `%${search}%`);

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: invoices, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tagihan & Pembayaran</h2>
        <Link href="/admin/invoices/pay">
          <Button>Catat Pembayaran</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <form className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input name="search" defaultValue={search} placeholder="Cari no. invoice..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </form>
            <form className="flex gap-2">
              <select name="status" defaultValue={filterStatus}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                <option value="">Semua</option>
                <option value="unpaid">Belum Bayar</option>
                <option value="paid">Lunas</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button type="submit" variant="outline" size="sm">Filter</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">#</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Invoice</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Penyewa</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Kamar</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Periode</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Tagihan</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, idx) => (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 text-sm">{from + idx + 1}</td>
                        <td className="py-3 px-2 font-medium text-sm">{inv.invoice_number}</td>
                        <td className="py-3 px-2 text-sm">
                          {(inv as any).tenants?.full_name || "-"}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {(inv as any).rental_contracts?.rooms?.name || "-"}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <span className="text-muted-foreground">{inv.period_start} — {inv.period_end}</span>
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <span className="font-medium">Rp {inv.total_amount.toLocaleString("id-ID")}</span>
                          {inv.fine_amount > 0 && (
                            <span className="text-xs text-destructive block">
                              + denda Rp {inv.fine_amount.toLocaleString("id-ID")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge type="invoice" status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {from + 1}-{Math.min(to + 1, count ?? 0)} dari {count}
                  </p>
                  <div className="flex gap-1">
                    {page > 1 && (
                      <Link href={`/admin/invoices?status=${filterStatus}&search=${search}&page=${page - 1}`}
                        className="px-3 py-1 rounded border border-border text-sm hover:bg-muted">←</Link>)}
                    {page < totalPages && (
                      <Link href={`/admin/invoices?status=${filterStatus}&search=${search}&page=${page + 1}`}
                        className="px-3 py-1 rounded border border-border text-sm hover:bg-muted">→</Link>)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada tagihan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";

interface ContractsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const params = await searchParams;
  const filterStatus = params.status || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const supabase = await createSupabase();

  let query = supabase
    .from("rental_contracts")
    .select("*, tenants(full_name), rooms(name)", { count: "exact" });

  if (filterStatus) query = query.eq("status", filterStatus);

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: contracts, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kontrak Sewa</h2>
        <Link href="/admin/contracts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Kontrak Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <form className="flex gap-2">
            <select
              name="status"
              defaultValue={filterStatus}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
            <Button type="submit" variant="outline" size="sm">
              Filter
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {contracts && contracts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">#</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Penyewa</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Kamar</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Periode</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Harga</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Status</th>
                      <th className="text-right text-sm font-semibold text-muted-foreground pb-3 px-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c, idx) => {
                      const tenant = (c as any).tenants as { full_name: string } | null;
                      const room = (c as any).rooms as { name: string } | null;
                      return (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 text-sm">{from + idx + 1}</td>
                          <td className="py-3 px-2 font-medium">{tenant?.full_name || "-"}</td>
                          <td className="py-3 px-2 text-sm">{room?.name || "-"}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {c.start_date} — {c.end_date}
                          </td>
                          <td className="py-3 px-2 text-sm">Rp {c.monthly_price.toLocaleString("id-ID")}</td>
                          <td className="py-3 px-2">
                            <StatusBadge type="contract" status={c.status} />
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Link href={`/admin/contracts/${c.id}`}>
                              <Button variant="ghost" size="sm">Detail</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
                      <Link
                        href={`/admin/contracts?status=${filterStatus}&page=${page - 1}`}
                        className="px-3 py-1 rounded border border-border text-sm hover:bg-muted"
                      >←</Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={`/admin/contracts?status=${filterStatus}&page=${page + 1}`}
                        className="px-3 py-1 rounded border border-border text-sm hover:bg-muted"
                      >→</Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada kontrak sewa.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

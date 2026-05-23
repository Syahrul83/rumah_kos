import Link from "next/link";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";

interface TenantsPageProps {
  searchParams: Promise<{ search?: string; page?: string; status?: string }>;
}

const ITEMS_PER_PAGE = 10;

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const filterStatus = params.status || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const supabase = await createSupabase();

  let query = supabase.from("tenants").select("*, rooms(name)", { count: "exact" });

  if (search) query = query.ilike("full_name", `%${search}%`);
  if (filterStatus) query = query.eq("status", filterStatus);

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: tenants, count } = await query.order("full_name").range(from, to);
  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daftar Penyewa</h2>
        <Link href="/admin/tenants/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Penyewa
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <form className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Cari nama / no HP..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </form>
            <form className="flex gap-2">
              <select
                name="status"
                defaultValue={filterStatus}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                onChange={(e) => e.currentTarget.form?.submit()}
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
              <Button type="submit" variant="outline" size="sm">
                Filter
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {tenants && tenants.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">#</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Nama</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">No HP</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Kamar</th>
                      <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Status</th>
                      <th className="text-center text-sm font-semibold text-muted-foreground pb-3 px-2">Blokir</th>
                      <th className="text-right text-sm font-semibold text-muted-foreground pb-3 px-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant, idx) => (
                      <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 text-sm">{from + idx + 1}</td>
                        <td className="py-3 px-2 font-medium">{tenant.full_name}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{tenant.phone}</td>
                        <td className="py-3 px-2 text-sm">{((tenant as any).rooms as any)?.name || "-"}</td>
                        <td className="py-3 px-2">
                          <StatusBadge type="tenant" status={tenant.status} />
                        </td>
                        <td className="py-3 px-2 text-center">
                          {tenant.is_blacklisted ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Diblokir
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Link href={`/admin/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm">
                              Detail
                            </Button>
                          </Link>
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
                      <Link href={`/admin/tenants?search=${search}&status=${filterStatus}&page=${page - 1}`} className="px-3 py-1 rounded border border-border text-sm hover:bg-muted">
                        ←
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link href={`/admin/tenants?search=${search}&status=${filterStatus}&page=${page + 1}`} className="px-3 py-1 rounded border border-border text-sm hover:bg-muted">
                        →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada data penyewa.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

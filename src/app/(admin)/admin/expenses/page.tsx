import Link from "next/link";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2 } from "lucide-react";
import { deleteExpense } from "@/lib/actions/expense-actions";

interface ExpensesPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const filterCat = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const supabase = await createSupabase();

  let query = supabase.from("expenses").select("*, profiles(full_name)", { count: "exact" });
  if (filterCat) query = query.eq("category", filterCat);

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: expenses, count } = await query
    .order("date", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteExpense(id);
  }

  const categories = ["listrik", "air", "kebersihan", "perbaikan", "gaji", "internet", "keamanan", "lainnya"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pengeluaran</h2>
        <Link href="/admin/expenses/new">
          <Button><Plus className="h-4 w-4 mr-2" />Tambah Pengeluaran</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <form className="flex gap-2">
            <select name="category" defaultValue={filterCat}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">Filter</Button>
          </form>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-semibold pb-3 px-2">#</th>
                      <th className="text-left text-sm font-semibold pb-3 px-2">Tanggal</th>
                      <th className="text-left text-sm font-semibold pb-3 px-2">Kategori</th>
                      <th className="text-left text-sm font-semibold pb-3 px-2">Deskripsi</th>
                      <th className="text-left text-sm font-semibold pb-3 px-2">Jumlah</th>
                      <th className="text-left text-sm font-semibold pb-3 px-2">Oleh</th>
                      <th className="text-right text-sm font-semibold pb-3 px-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e, idx) => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-2 text-sm">{from + idx + 1}</td>
                        <td className="py-3 px-2 text-sm">{e.date}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                            {e.custom_category || e.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm">{e.description}</td>
                        <td className="py-3 px-2 text-sm font-medium">
                          Rp {e.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {(e as any).profiles?.full_name || "-"}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={e.id} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{from + 1}-{Math.min(to + 1, count ?? 0)} dari {count}</p>
                  <div className="flex gap-1">
                    {page > 1 && <Link href={`/admin/expenses?category=${filterCat}&page=${page - 1}`} className="px-3 py-1 rounded border border-border text-sm hover:bg-muted">←</Link>}
                    {page < totalPages && <Link href={`/admin/expenses?category=${filterCat}&page=${page + 1}`} className="px-3 py-1 rounded border border-border text-sm hover:bg-muted">→</Link>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada pengeluaran.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

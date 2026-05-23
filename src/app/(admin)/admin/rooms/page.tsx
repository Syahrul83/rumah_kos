import Link from "next/link";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

interface RoomsPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10;

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const supabase = await createSupabase();

  let query = supabase.from("rooms").select("*", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: rooms, count } = await query
    .order("name")
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  const statusColor: Record<string, string> = {
    tersedia: "bg-emerald-50 text-emerald-700 border-emerald-200",
    terisi: "bg-secondary/10 text-secondary border-secondary/30",
    perbaikan: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daftar Kamar</h2>
        <Link href="/admin/rooms/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kamar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            <form className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Cari nama kamar..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </form>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rooms && rooms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">#</th>
                    <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Nama</th>
                    <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Lantai</th>
                    <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Harga</th>
                    <th className="text-left text-sm font-semibold text-muted-foreground pb-3 px-2">Status</th>
                    <th className="text-right text-sm font-semibold text-muted-foreground pb-3 px-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room, index) => (
                    <tr key={room.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 text-sm">{from + index + 1}</td>
                      <td className="py-3 px-2 font-medium">{room.name}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{room.floor}</td>
                      <td className="py-3 px-2 text-sm">Rp {room.price.toLocaleString("id-ID")}</td>
                      <td className="py-3 px-2">
                        <Badge className={statusColor[room.status] || ""} variant="outline">
                          {room.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/rooms/${room.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <form action={`/admin/rooms/${room.id}/delete`} method="POST">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada kamar.</p>
              <Link href="/admin/rooms/new" className="text-primary hover:underline mt-2 inline-block">
                Tambah kamar pertama
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {from + 1}-{Math.min(to + 1, count ?? 0)} dari {count} kamar
              </p>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={`/admin/rooms?search=${search}&page=${page - 1}`}
                    className="px-3 py-1 rounded border border-border text-sm hover:bg-muted"
                  >
                    ←
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/rooms?search=${search}&page=${page + 1}`}
                    className="px-3 py-1 rounded border border-border text-sm hover:bg-muted"
                  >
                    →
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { deleteRoom } from "@/lib/actions/room-actions";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabase();

  const { data: room } = await supabase.from("rooms").select("*").eq("id", id).single();
  if (!room) return notFound();

  const { data: contracts } = await supabase
    .from("rental_contracts")
    .select("*, tenants(full_name)")
    .eq("room_id", id)
    .order("start_date", { ascending: false });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/rooms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Detail Kamar</h2>
        <div className="ml-auto flex gap-2">
          <Link href={`/admin/rooms/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{room.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Lantai</p>
              <p className="font-medium">{room.floor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Harga / Bulan</p>
              <p className="font-medium">Rp {room.price.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge type="room" status={room.status} />
            </div>
          </div>
          {room.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Deskripsi</p>
                <p className="text-sm mt-1">{room.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Kontrak</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts && contracts.length > 0 ? (
            <div className="space-y-2">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {c.tenants as unknown as { full_name: string }} ({(c as any).tenants?.full_name || "-"})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.start_date} — {c.end_date}
                    </p>
                  </div>
                  <StatusBadge type="contract" status={c.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada kontrak untuk kamar ini.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

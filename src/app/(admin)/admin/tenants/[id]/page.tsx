import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, ShieldBan, ShieldCheck } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { blacklistTenant, unblacklistTenant } from "@/lib/actions/tenant-actions";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabase();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, rooms(name)")
    .eq("id", id)
    .single();

  if (!tenant) return <p className="p-6">Penyewa tidak ditemukan.</p>;

  const { data: contracts } = await supabase
    .from("rental_contracts")
    .select("*")
    .eq("tenant_id", id)
    .order("start_date", { ascending: false });

  const blacklistAction = async () => {
    "use server";
    if (tenant.is_blacklisted) {
      await unblacklistTenant(id);
    } else {
      await blacklistTenant(id, "Diblokir oleh admin");
    }
    redirect(`/admin/tenants/${id}`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Detail Penyewa</h2>
        <div className="ml-auto flex gap-2">
          <form action={blacklistAction}>
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className={tenant.is_blacklisted ? "text-emerald-600" : "text-destructive"}
            >
              {tenant.is_blacklisted ? (
                <><ShieldCheck className="h-4 w-4 mr-2" /> Buka Blokir</>
              ) : (
                <><ShieldBan className="h-4 w-4 mr-2" /> Blokir</>
              )}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tenant.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge type="tenant" status={tenant.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kamar Saat Ini</p>
              <p className="font-medium">{(tenant as any).rooms?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No. HP</p>
              <p>{tenant.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No. KTP</p>
              <p>{tenant.identity_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kontak Darurat</p>
              <p>{tenant.emergency_contact || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tgl Masuk</p>
              <p>{tenant.check_in_date || "-"}</p>
            </div>
          </div>

          {tenant.address && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p className="text-sm mt-1">{tenant.address}</p>
              </div>
            </>
          )}

          {tenant.is_blacklisted && (
            <>
              <Separator />
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-700">Diblokir</p>
                <p className="text-sm text-red-600 mt-1">{tenant.blacklist_reason}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {contracts && contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Kontrak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">
                      {c.start_date} — {c.end_date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.duration_months} bulan • Rp {c.monthly_price.toLocaleString("id-ID")}/bulan
                    </p>
                  </div>
                  <StatusBadge type="contract" status={c.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { createSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/lib/actions/auth-actions";
import { revalidatePath } from "next/cache";

export default async function TenantProfile() {
  const supabase = await createSupabase();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return <p className="p-4">Silakan login.</p>;

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", authUser.id).single();
  const { data: tenant } = await supabase.from("tenants").select("*, rooms(name)").eq("user_id", authUser.id).single();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Profil Saya</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Nama</p>
            <p className="font-medium">{profile?.full_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{authUser.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">No. HP</p>
            <p className="font-medium">{profile?.phone || tenant?.phone || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {tenant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Kontrak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Kamar</p>
              <p>{(tenant as any).rooms?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p>{tenant.status === "aktif" ? "Aktif" : "Tidak Aktif"}</p>
            </div>
            {tenant.check_in_date && (
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Masuk</p>
                <p>{tenant.check_in_date}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      <form action={logout}>
        <Button variant="outline" className="w-full text-destructive">
          Keluar
        </Button>
      </form>
    </div>
  );
}

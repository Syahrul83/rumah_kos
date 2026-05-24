import { redirect } from "next/navigation";
import { createSupabase, getUser } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revalidatePath } from "next/cache";

async function updateSetting(key: string, formData: FormData) {
  "use server";
  const user = await getUser();
  if (user?.role !== "super_admin") throw new Error("Unauthorized");
  const supabase = await createSupabase();
  const value = formData.get(key) as string;
  await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  revalidatePath("/admin/settings");
}

export default async function SettingsPage() {
  const user = await getUser();
  if (user?.role !== "super_admin") redirect("/admin");

  const supabase = await createSupabase();
  const { data: settings } = await supabase.from("settings").select("*");

  const getVal = (key: string) => settings?.find((s) => s.key === key)?.value || "";

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Pengaturan</h2>

      <Tabs defaultValue="kost">
        <TabsList>
          <TabsTrigger value="kost">Profil Kost</TabsTrigger>
          <TabsTrigger value="payment">Pembayaran</TabsTrigger>
          <TabsTrigger value="midtrans">Midtrans</TabsTrigger>
        </TabsList>

        <TabsContent value="kost">
          <Card>
            <CardHeader>
              <CardTitle>Profil Kost</CardTitle>
              <CardDescription>Informasi dasar kost</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "kost_name", label: "Nama Kost", type: "text" },
                { key: "kost_address", label: "Alamat", type: "text" },
                { key: "kost_phone", label: "No. Telepon", type: "text" },
                { key: "kost_code", label: "Kode Kost", type: "text" },
              ].map((f) => (
                <form key={f.key} action={updateSetting.bind(null, f.key)} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">{f.label}</label>
                    <Input name={f.key} type={f.type} defaultValue={getVal(f.key)} />
                  </div>
                  <Button type="submit" size="sm">Simpan</Button>
                </form>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "fine_method", label: "Metode Denda (fixed / percentage)", type: "text" },
                { key: "fine_fixed_daily", label: "Denda Fixed per Hari (Rp)", type: "number" },
                { key: "fine_percentage_daily", label: "Denda Persentase per Hari (%)", type: "number" },
                { key: "grace_period_days", label: "Grace Period (hari)", type: "number" },
                { key: "generate_day", label: "Tanggal Generate Invoice (1-28)", type: "number" },
                { key: "due_day", label: "Tanggal Jatuh Tempo (1-28)", type: "number" },
              ].map((f) => (
                <form key={f.key} action={updateSetting.bind(null, f.key)} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">{f.label}</label>
                    <Input name={f.key} type={f.type} defaultValue={getVal(f.key)} />
                  </div>
                  <Button type="submit" size="sm">Simpan</Button>
                </form>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="midtrans">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Midtrans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                Masukkan Midtrans keys Anda. Saat ini mode: <strong>{getVal("midtrans_mode") || "sandbox"}</strong>
              </div>
              {[
                { key: "midtrans_mode", label: "Mode (sandbox / production)", type: "text" },
              ].map((f) => (
                <form key={f.key} action={updateSetting.bind(null, f.key)} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">{f.label}</label>
                    <Input name={f.key} type={f.type} defaultValue={getVal(f.key)} />
                  </div>
                  <Button type="submit" size="sm">Simpan</Button>
                </form>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

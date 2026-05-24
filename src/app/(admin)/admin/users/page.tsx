import { redirect } from "next/navigation";
import { createSupabase, getUser } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldBan, ShieldCheck } from "lucide-react";

export default async function UsersPage() {
  const user = await getUser();
  if (user?.role !== "super_admin") redirect("/admin");

  const supabase = await createSupabase();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manajemen User</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-semibold pb-3 px-2">Nama</th>
                  <th className="text-left text-sm font-semibold pb-3 px-2">Email</th>
                  <th className="text-left text-sm font-semibold pb-3 px-2">Role</th>
                  <th className="text-left text-sm font-semibold pb-3 px-2">Status</th>
                  <th className="text-right text-sm font-semibold pb-3 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{p.full_name}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{p.user_id}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={
                        p.role === "super_admin" ? "bg-red-50 text-red-700 border-red-200" :
                        p.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }>{p.role}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      {p.is_active ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {p.user_id !== user?.user_id && (
                        <form action={async () => { "use server"; }}>
                          <Button variant="ghost" size="sm" className={p.is_active ? "text-destructive" : "text-emerald-600"}>
                            {p.is_active ? (
                              <><ShieldBan className="h-4 w-4 mr-1" /> Nonaktifkan</>
                            ) : (
                              <><ShieldCheck className="h-4 w-4 mr-1" /> Aktifkan</>
                            )}
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

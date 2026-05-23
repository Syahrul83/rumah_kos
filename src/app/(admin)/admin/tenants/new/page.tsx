"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenant } from "@/lib/actions/tenant-actions";
import {
  tenantSchema,
  tenantWithAccountSchema,
  type TenantFormData,
  type TenantWithAccountFormData,
} from "@/lib/validators/tenant-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [withAccount, setWithAccount] = useState(false);
  const [password, setPassword] = useState("");

  const form = useForm<TenantFormData | TenantWithAccountFormData>({
    resolver: zodResolver(withAccount ? tenantWithAccountSchema : tenantSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      identity_number: "",
      emergency_contact: "",
      address: "",
      ...(withAccount ? { email: "", password: "" } : {}),
    },
  });

  const toggleMode = (val: boolean) => {
    setWithAccount(val);
    form.clearErrors();
  };

  const getStrength = (pw: string) => {
    if (!pw) return { label: "", percent: 0 };
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[a-z]/.test(pw)) score += 15;
    if (/[A-Z]/.test(pw)) score += 15;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pw)) score += 25;
    if (pw.length >= 12) score += 10;
    const label = score < 40 ? "Lemah" : score < 70 ? "Sedang" : "Kuat";
    return { label, percent: Math.min(score, 100) };
  };

  const strength = getStrength(password);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const fd = new FormData();
    fd.set("with_account", String(withAccount));
    fd.set("full_name", data.full_name);
    fd.set("phone", data.phone || "");
    fd.set("identity_number", data.identity_number || "");
    fd.set("emergency_contact", data.emergency_contact || "");
    fd.set("address", data.address || "");
    if (withAccount) {
      fd.set("email", data.email);
      fd.set("password", data.password);
    }

    const result = await createTenant(fd);
    if (result.success) {
      toast.success("Penyewa berhasil ditambahkan");
      router.push("/admin/tenants");
      router.refresh();
    } else if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([key, errors]) => {
        form.setError(key as any, { message: errors[0] });
      });
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Penyewa Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 p-1 rounded-lg bg-muted">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !withAccount ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Tanpa Akun
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                withAccount ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Dengan Akun
            </button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input {...form.register("full_name")} placeholder="Nama Lengkap" />
              {(form.formState.errors as any).full_name && (
                <p className="text-sm text-destructive">{(form.formState.errors as any).full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">No. HP</label>
              <Input {...form.register("phone")} placeholder="081234567890" />
              {(form.formState.errors as any).phone && (
                <p className="text-sm text-destructive">{(form.formState.errors as any).phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. KTP (opsional)</label>
                <Input {...form.register("identity_number")} placeholder="16 digit" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kontak Darurat</label>
                <Input {...form.register("emergency_contact")} placeholder="No HP" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat (opsional)</label>
              <Textarea {...form.register("address")} placeholder="Alamat lengkap..." rows={2} />
            </div>

            {withAccount && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input {...form.register("email")} type="email" placeholder="nama@email.com" />
                  {(form.formState.errors as any).email && (
                    <p className="text-sm text-destructive">{(form.formState.errors as any).email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      form.setValue("password" as any, e.target.value);
                    }}
                  />
                  {password && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            strength.percent < 40 ? "bg-destructive" : strength.percent < 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${strength.percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Kekuatan: {strength.label} ({strength.percent}%)</p>
                    </div>
                  )}
                  {(form.formState.errors as any).password && (
                    <p className="text-sm text-destructive">{(form.formState.errors as any).password.message}</p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Penyewa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

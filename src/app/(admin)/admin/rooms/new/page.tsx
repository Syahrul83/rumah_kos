"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoom } from "@/lib/actions/room-actions";
import { roomSchema, type RoomFormData } from "@/lib/validators/room-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      floor: 1,
      price: 500000,
      description: "",
      status: "tersedia",
    },
  });

  const onSubmit = async (data: RoomFormData) => {
    setLoading(true);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("floor", String(data.floor));
    formData.set("price", String(data.price));
    formData.set("description", data.description || "");
    formData.set("status", data.status);

    const result = await createRoom(formData);

    if (result.success) {
      toast.success("Kamar berhasil ditambahkan");
      router.push("/admin/rooms");
      router.refresh();
    } else if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([key, errors]) => {
        form.setError(key as keyof RoomFormData, { message: errors[0] });
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
          <CardTitle>Tambah Kamar Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kamar</label>
              <Input {...form.register("name")} placeholder="A-01" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lantai</label>
                <Input
                  type="number"
                  {...form.register("floor", { valueAsNumber: true })}
                  placeholder="1"
                />
                {form.formState.errors.floor && (
                  <p className="text-sm text-destructive">{form.formState.errors.floor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Harga / Bulan</label>
                <Input
                  type="number"
                  {...form.register("price", { valueAsNumber: true })}
                  placeholder="500000"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi (opsional)</label>
              <Textarea {...form.register("description")} placeholder="Deskripsi kamar..." rows={3} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                onValueChange={(value) => form.setValue("status", value as RoomFormData["status"])}
                defaultValue="tersedia"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tersedia">Tersedia</SelectItem>
                  <SelectItem value="perbaikan">Perbaikan</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Kamar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

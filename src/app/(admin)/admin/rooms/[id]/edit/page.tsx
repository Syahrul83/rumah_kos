"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateRoom } from "@/lib/actions/room-actions";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [roomId, setRoomId] = useState("");

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  useEffect(() => {
    async function init() {
      const { id } = await params;
      setRoomId(id);
      const res = await fetch(`/api/rooms/${id}`);
      if (res.ok) {
        const room = await res.json();
        form.reset({
          name: room.name,
          floor: room.floor,
          price: room.price,
          description: room.description || "",
          status: room.status,
        });
      }
      setFetching(false);
    }
    init();
  }, [params, form]);

  const onSubmit = async (data: RoomFormData) => {
    if (!roomId) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("floor", String(data.floor));
    formData.set("price", String(data.price));
    formData.set("description", data.description || "");
    formData.set("status", data.status);

    const result = await updateRoom(roomId, formData);

    if (result.success) {
      toast.success("Kamar berhasil diperbarui");
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

  if (fetching) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Kamar</CardTitle>
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
                <Input type="number" {...form.register("floor", { valueAsNumber: true })} />
                {form.formState.errors.floor && (
                  <p className="text-sm text-destructive">{form.formState.errors.floor.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Harga / Bulan</label>
                <Input type="number" {...form.register("price", { valueAsNumber: true })} />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea {...form.register("description")} rows={3} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                onValueChange={(value) => form.setValue("status", value as RoomFormData["status"])}
                value={form.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tersedia">Tersedia</SelectItem>
                  <SelectItem value="terisi">Terisi</SelectItem>
                  <SelectItem value="perbaikan">Perbaikan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

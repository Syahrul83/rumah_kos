"use server";

import { revalidatePath } from "next/cache";
import { createSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/server";
import { roomSchema, type RoomFormData } from "@/lib/validators/room-schema";

export type RoomActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function checkAccess() {
  const role = await getUserRole();
  if (!role || !["super_admin", "admin"].includes(role)) {
    throw new Error("Unauthorized");
  }
}

export async function createRoom(formData: FormData): Promise<RoomActionResult> {
  await checkAccess();

  const rawData = {
    name: formData.get("name"),
    floor: Number(formData.get("floor")),
    price: Number(formData.get("price")),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "tersedia",
  };

  const validated = roomSchema.safeParse(rawData);
  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createSupabase();

  const { data: existing } = await supabase
    .from("rooms")
    .select("id")
    .ilike("name", validated.data.name)
    .single();

  if (existing) {
    return { fieldErrors: { name: ["Nama kamar sudah digunakan"] } };
  }

  const { error } = await supabase.from("rooms").insert(validated.data as any);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/rooms");
  return { success: true };
}

export async function updateRoom(id: string, formData: FormData): Promise<RoomActionResult> {
  await checkAccess();

  const rawData = {
    name: formData.get("name"),
    floor: Number(formData.get("floor")),
    price: Number(formData.get("price")),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "tersedia",
  };

  const validated = roomSchema.safeParse(rawData);
  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createSupabase();

  const { data: existing } = await supabase
    .from("rooms")
    .select("id")
    .ilike("name", validated.data.name)
    .neq("id", id)
    .single();

  if (existing) {
    return { fieldErrors: { name: ["Nama kamar sudah digunakan"] } };
  }

  const { error } = await supabase
    .from("rooms")
    .update(validated.data as any)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/rooms");
  return { success: true };
}

export async function deleteRoom(id: string): Promise<RoomActionResult> {
  await checkAccess();

  const supabase = await createSupabase();

  const { data: room } = await supabase
    .from("rooms")
    .select("status")
    .eq("id", id)
    .single();

  if (room?.status === "terisi") {
    return { error: "Kamar yang sedang terisi tidak dapat dihapus" };
  }

  const { error } = await supabase.from("rooms").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/rooms");
  return { success: true };
}

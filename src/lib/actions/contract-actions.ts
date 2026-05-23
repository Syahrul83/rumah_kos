"use server";

import { revalidatePath } from "next/cache";
import { createSupabase, getUserRole } from "@/lib/supabase/server";

export type ContractActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function checkAccess() {
  const role = await getUserRole();
  if (!role || !["super_admin", "admin"].includes(role)) throw new Error("Unauthorized");
}

const contractSchema = {
  tenant_id: (v: any) => typeof v === "string" && v.length > 0,
  room_id: (v: any) => typeof v === "string" && v.length > 0,
  start_date: (v: any) => typeof v === "string" && v.length > 0,
  duration_months: (v: any) => parseInt(v) >= 1,
  monthly_price: (v: any) => parseInt(v) >= 100000,
  deposit: (v: any) => parseInt(v) >= 0,
};

function formatInvoiceNumber(): string {
  const now = new Date();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${rand}`;
}

export async function createContract(
  _prevState: ContractActionResult | null,
  formData: FormData
): Promise<ContractActionResult | null> {
  await checkAccess();
  const supabase = await createSupabase();

  const tenantId = formData.get("tenant_id") as string;
  const roomId = formData.get("room_id") as string;
  const startDate = formData.get("start_date") as string;
  const dur = parseInt(formData.get("duration_months") as string);
  const price = parseInt(formData.get("monthly_price") as string);
  const depositVal = parseInt(formData.get("deposit") as string);
  const makeInvoice = formData.get("create_invoice") === "true";

  if (!tenantId || !roomId || !startDate || !dur || !price) {
    return { error: "Semua field wajib diisi" };
  }

  // Calculate end_date
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + dur);

  // Check: tenant has no active contract
  const { data: existing } = await supabase
    .from("rental_contracts")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "aktif")
    .maybeSingle();

  if (existing) return { error: "Penyewa sudah memiliki kontrak aktif" };

  // Check: room is available
  const { data: room } = await supabase
    .from("rooms")
    .select("status")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Kamar tidak ditemukan" };
  if (room.status !== "tersedia") return { error: "Kamar sedang tidak tersedia" };

  // Insert contract
  const { data: contract, error: err } = await supabase
    .from("rental_contracts")
    .insert({
      tenant_id: tenantId,
      room_id: roomId,
      start_date: startDate,
      end_date: end.toISOString().split("T")[0],
      duration_months: dur,
      monthly_price: price,
      deposit: depositVal || 0,
      status: "aktif",
    })
    .select()
    .single();

  if (err) return { error: err.message };

  // Update room
  await supabase.from("rooms").update({ status: "terisi" }).eq("id", roomId);

  // Update tenant
  await supabase
    .from("tenants")
    .update({ status: "aktif", room_id: roomId, check_in_date: startDate })
    .eq("id", tenantId);

  // Create first invoice
  if (makeInvoice) {
    await supabase.from("invoices").insert({
      contract_id: contract.id,
      tenant_id: tenantId,
      invoice_number: formatInvoiceNumber(),
      period_start: startDate,
      period_end: end.toISOString().split("T")[0],
      amount: price,
      fine_amount: 0,
      total_amount: price,
      due_date: startDate,
      status: "unpaid",
    });
  }

  revalidatePath("/admin/contracts");
  return { success: true };
}

export async function terminateContract(id: string): Promise<ContractActionResult> {
  await checkAccess();
  const supabase = await createSupabase();

  const { data: contract } = await supabase
    .from("rental_contracts")
    .select("tenant_id, room_id")
    .eq("id", id)
    .single();
  if (!contract) return { error: "Kontrak tidak ditemukan" };

  await supabase.from("rental_contracts").update({ status: "selesai" }).eq("id", id);
  await supabase.from("rooms").update({ status: "tersedia" }).eq("id", contract.room_id);
  await supabase
    .from("tenants")
    .update({
      status: "tidak_aktif",
      check_out_date: new Date().toISOString().split("T")[0],
      room_id: null,
    })
    .eq("id", contract.tenant_id);

  revalidatePath("/admin/contracts");
  revalidatePath("/admin/tenants");
  return { success: true };
}

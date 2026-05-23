"use server";

import { revalidatePath } from "next/cache";
import { createSupabase, getUserRole } from "@/lib/supabase/server";

export type PaymentActionResult = {
  success?: boolean;
  error?: string;
};

async function checkAccess() {
  const role = await getUserRole();
  if (!role || !["super_admin", "admin"].includes(role)) throw new Error("Unauthorized");
}

export async function recordPayment(
  _prevState: PaymentActionResult | null,
  formData: FormData
): Promise<PaymentActionResult | null> {
  await checkAccess();
  const supabase = await createSupabase();

  const invoiceId = formData.get("invoice_id") as string;
  const method = formData.get("payment_method") as string;
  const amount = parseInt(formData.get("amount") as string);
  const date = formData.get("payment_date") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!invoiceId || !method || !amount || !date) {
    return { error: "Semua field harus diisi" };
  }

  if (amount <= 0) return { error: "Jumlah harus lebih dari 0" };

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status, total_amount, tenant_id")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return { error: "Invoice tidak ditemukan" };
  if (invoice.status === "paid") return { error: "Invoice sudah lunas" };
  if (amount > invoice.total_amount) return { error: "Jumlah melebihi total tagihan" };

  // Record payment
  const { error: payErr } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    tenant_id: invoice.tenant_id,
    amount,
    payment_method: method,
    payment_date: date,
    status: "settlement",
    notes,
  });

  if (payErr) return { error: payErr.message };

  // Update invoice
  await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId);

  revalidatePath("/admin/invoices");
  return { success: true };
}

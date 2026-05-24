"use server";

import { revalidatePath } from "next/cache";
import { createSupabase, getUserRole } from "@/lib/supabase/server";
import { z } from "zod";

const expenseSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi").max(200).trim(),
  amount: z.number().int().min(1000, "Minimal Rp 1.000").max(100_000_000),
  category: z.enum(["listrik", "air", "kebersihan", "perbaikan", "gaji", "internet", "keamanan", "lainnya"]),
  custom_category: z.string().max(100).optional().nullable(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().max(200).optional().nullable(),
});

export type ExpenseActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function checkAccess() {
  const role = await getUserRole();
  if (!role || !["super_admin", "admin"].includes(role)) throw new Error("Unauthorized");
}

export async function createExpense(formData: FormData): Promise<ExpenseActionResult> {
  await checkAccess();
  const supabase = await createSupabase();

  const validated = expenseSchema.safeParse({
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    category: formData.get("category"),
    custom_category: formData.get("custom_category") || null,
    date: formData.get("date"),
    notes: formData.get("notes") || null,
  });

  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const user = await supabase.auth.getUser();
  const { error } = await supabase.from("expenses").insert({
    ...validated.data,
    created_by: user.data.user?.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function deleteExpense(id: string): Promise<ExpenseActionResult> {
  await checkAccess();
  const supabase = await createSupabase();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  return { success: true };
}

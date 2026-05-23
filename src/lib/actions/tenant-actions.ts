"use server";

import { revalidatePath } from "next/cache";
import { createSupabase, getUserRole } from "@/lib/supabase/server";
import { tenantSchema, tenantWithAccountSchema } from "@/lib/validators/tenant-schema";
import { createAdminClient } from "@/lib/supabase/admin";

export type TenantActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function checkAccess() {
  const role = await getUserRole();
  if (!role || !["super_admin", "admin"].includes(role)) throw new Error("Unauthorized");
}

export async function createTenant(formData: FormData): Promise<TenantActionResult> {
  await checkAccess();

  const withAccount = formData.get("with_account") === "true";

  if (withAccount) {
    const validated = tenantWithAccountSchema.safeParse({
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      identity_number: formData.get("identity_number") || undefined,
      emergency_contact: formData.get("emergency_contact") || undefined,
      address: formData.get("address") || undefined,
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validated.success) {
      return { fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const adminClient = createAdminClient();

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: validated.data.email,
      password: validated.data.password,
      email_confirm: true,
      user_metadata: { full_name: validated.data.full_name },
    });

    if (authError) {
      if (authError.message.includes("already")) {
        return { fieldErrors: { email: ["Email sudah terdaftar"] } };
      }
      return { error: authError.message };
    }

    const supabase = await createSupabase();
    const { error } = await supabase.from("tenants").insert({
      user_id: authUser.user.id,
      full_name: validated.data.full_name,
      phone: validated.data.phone,
      identity_number: validated.data.identity_number || null,
      emergency_contact: validated.data.emergency_contact || null,
      address: validated.data.address || null,
      status: "tidak_aktif",
    });

    if (error) return { error: error.message };
  } else {
    const validated = tenantSchema.safeParse({
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      identity_number: formData.get("identity_number") || undefined,
      emergency_contact: formData.get("emergency_contact") || undefined,
      address: formData.get("address") || undefined,
    });

    if (!validated.success) {
      return { fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const supabase = await createSupabase();
    const { error } = await supabase.from("tenants").insert({
      user_id: null,
      ...validated.data,
      status: "tidak_aktif",
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/tenants");
  return { success: true };
}

export async function updateTenant(id: string, formData: FormData): Promise<TenantActionResult> {
  await checkAccess();

  const validated = tenantSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    identity_number: formData.get("identity_number") || undefined,
    emergency_contact: formData.get("emergency_contact") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.from("tenants").update(validated.data as any).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/tenants");
  return { success: true };
}

export async function blacklistTenant(id: string, reason: string): Promise<TenantActionResult> {
  await checkAccess();
  const supabase = await createSupabase();

  const { data: tenant } = await supabase.from("tenants").select("user_id").eq("id", id).single();
  if (!tenant) return { error: "Tenant tidak ditemukan" };

  const update: any = {
    is_blacklisted: true,
    blacklist_reason: reason,
    blacklisted_at: new Date().toISOString(),
  };

  if (tenant.user_id) {
    update.blacklisted_by = (await supabase.auth.getUser()).data.user?.id;
  }

  const { error } = await supabase.from("tenants").update(update).eq("id", id);
  if (error) return { error: error.message };

  if (tenant.user_id) {
    await supabase.from("profiles").update({
      is_active: false,
      deactivated_reason: `Diblokir: ${reason}`,
    }).eq("user_id", tenant.user_id);
  }

  revalidatePath("/admin/tenants");
  return { success: true };
}

export async function unblacklistTenant(id: string): Promise<TenantActionResult> {
  await checkAccess();
  const supabase = await createSupabase();

  const { data: tenant } = await supabase.from("tenants").select("user_id").eq("id", id).single();
  if (!tenant) return { error: "Tenant tidak ditemukan" };

  await supabase.from("tenants").update({
    is_blacklisted: false,
    blacklist_reason: null,
    blacklisted_at: null,
    blacklisted_by: null,
  }).eq("id", id);

  if (tenant.user_id) {
    await supabase.from("profiles").update({
      is_active: true,
      deactivated_reason: null,
    }).eq("user_id", tenant.user_id);
  }

  revalidatePath("/admin/tenants");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function createAuthSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

const loginSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter").max(100).trim(),
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka").trim(),
  phone: z.string().regex(/^(0|62|\+62)[0-9]{8,13}$/, "Format nomor HP tidak valid").optional().or(z.literal("")),
});

export type LoginState = { errors?: Record<string, string[]>; message?: string } | null;
export type RegisterState = { errors?: Record<string, string[]>; message?: string } | null;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const supabase = await createAuthSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") return { message: "Email atau password salah" };
    return { message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const validated = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const supabase = await createAuthSupabase();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: { data: { full_name: validated.data.full_name, phone: validated.data.phone || null } },
  });

  if (!error) {
    try {
      const admin = createAdminClient();
      const { data: users } = await admin.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email === validated.data.email);
      if (user && !user.email_confirmed_at) {
        await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
      }
    } catch { /* silent */ }
  }

  if (error) {
    if (error.message.includes("already")) return { message: "Email sudah terdaftar" };
    return { message: error.message };
  }

  redirect("/login?registered=true");
}

export async function logout() {
  const supabase = await createAuthSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

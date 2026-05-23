"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
  email: z.string().email("Email tidak valid").trim(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka")
    .trim(),
  phone: z
    .string()
    .regex(/^(0|62|\+62)[0-9]{8,13}$/, "Format nomor HP tidak valid")
    .optional()
    .or(z.literal("")),
});

export type LoginState = {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
} | null;

export type RegisterState = {
  errors?: {
    full_name?: string[];
    email?: string[];
    password?: string[];
    phone?: string[];
  };
  message?: string;
} | null;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { message: "Email atau password salah" };
    }
    return { message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const validated = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.full_name,
        phone: validated.data.phone || null,
      },
    },
  });

  if (error) {
    if (error.message.includes("already")) {
      return { message: "Email sudah terdaftar" };
    }
    return { message: error.message };
  }

  redirect("/login?registered=true");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

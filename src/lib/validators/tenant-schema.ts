import { z } from "zod";

export const tenantSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
  phone: z
    .string()
    .regex(/^(0|62|\+62)[0-9]{8,13}$/, "Format nomor HP tidak valid (08xx / +62xx)")
    .min(10, "Minimal 10 digit"),
  identity_number: z
    .string()
    .regex(/^\d{16}$/, "No KTP harus 16 digit angka")
    .optional()
    .or(z.literal("")),
  emergency_contact: z
    .string()
    .max(20, "Maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "Maksimal 200 karakter")
    .optional()
    .or(z.literal("")),
});

export const tenantWithAccountSchema = tenantSchema.extend({
  email: z.string().email("Email tidak valid").trim(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka")
    .trim(),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
export type TenantWithAccountFormData = z.infer<typeof tenantWithAccountSchema>;

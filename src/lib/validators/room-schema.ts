import { z } from "zod";

export const roomSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(20, "Nama maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9\-\s]+$/, "Hanya huruf, angka, dan strip")
    .trim(),
  floor: z
    .number({ message: "Lantai harus angka" })
    .int("Harus bilangan bulat")
    .min(1, "Minimal lantai 1")
    .max(100, "Maksimal lantai 100"),
  price: z
    .number({ message: "Harga harus angka" })
    .int("Harus bilangan bulat")
    .min(100000, "Minimal Rp 100.000")
    .max(100000000, "Maksimal Rp 100.000.000"),
  description: z
    .string()
    .max(200, "Maksimal 200 karakter")
    .optional()
    .nullable(),
  status: z.enum(["tersedia", "terisi", "perbaikan"]),
});

export type RoomFormData = z.infer<typeof roomSchema>;

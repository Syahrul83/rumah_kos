"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register, type RegisterState } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: RegisterState = null;

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, initialState);
  const [password, setPassword] = useState("");

  const getPasswordStrength = (pw: string): { label: string; color: string; percent: number } => {
    if (!pw) return { label: "", color: "", percent: 0 };
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[a-z]/.test(pw)) score += 15;
    if (/[A-Z]/.test(pw)) score += 15;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pw)) score += 25;
    if (pw.length >= 12) score += 10;

    if (score < 40) return { label: "Lemah", color: "bg-destructive", percent: score };
    if (score < 70) return { label: "Sedang", color: "bg-amber-500", percent: score };
    return { label: "Kuat", color: "bg-emerald-500", percent: Math.min(score, 100) };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">Kost</span>
            <span className="text-secondary">Ku</span>
          </h1>
          <p className="text-muted-foreground mt-2">Buat akun baru</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              Nama Lengkap
            </label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Nama Lengkap"
              required
              className={state?.errors?.full_name ? "border-destructive" : ""}
            />
            {state?.errors?.full_name && (
              <p className="text-sm text-destructive">{state.errors.full_name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              No. HP (opsional)
            </label>
            <Input
              id="phone"
              name="phone"
              placeholder="081234567890"
              className={state?.errors?.phone ? "border-destructive" : ""}
            />
            {state?.errors?.phone && (
              <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
              className={state?.errors?.email ? "border-destructive" : ""}
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimal 8 karakter"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={state?.errors?.password ? "border-destructive" : ""}
            />
            {password && strength.percent > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strength.color}`}
                    style={{ width: `${Math.min(strength.percent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Kekuatan password: {strength.label} ({Math.min(strength.percent, 100)}%)
                </p>
              </div>
            )}
            {state?.errors?.password && (
              <ul className="space-y-1">
                {state.errors.password.map((err) => (
                  <li key={err} className="text-sm text-destructive">
                    - {err}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {state?.message && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
              {state.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

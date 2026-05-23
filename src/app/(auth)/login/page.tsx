"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginState = null;

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const redirectMsg = searchParams.get("registered");
  const bannedMsg = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">Kost</span>
            <span className="text-secondary">Ku</span>
          </h1>
          <p className="text-muted-foreground mt-2">Masuk ke akun Anda</p>
        </div>

        {redirectMsg === "true" && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 text-center">
            Pendaftaran berhasil! Silakan login.
          </div>
        )}

        {bannedMsg === "banned" && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
            Akun Anda telah dinonaktifkan. Hubungi admin.
          </div>
        )}

        <form action={action} className="space-y-4">
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
              placeholder="••••••••"
              required
              className={state?.errors?.password ? "border-destructive" : ""}
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
              {state.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabase, getUser } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, CreditCard, FileText, User, LogOut, Receipt, Clock, Settings } from "lucide-react";
import { logout } from "@/lib/actions/auth-actions";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "penghuni") redirect("/admin");

  const navItems = [
    { href: "/tenant", label: "Beranda", icon: Home },
    { href: "/tenant/invoices", label: "Tagihan", icon: CreditCard },
    { href: "/tenant/payments", label: "Riwayat", icon: Receipt },
    { href: "/tenant/profile", label: "Saya", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/tenant" className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">Kost</span>
          <span className="text-lg font-bold text-secondary">Ku</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user.full_name}
          </span>
          <form action={logout}>
            <button className="p-2 rounded-lg hover:bg-muted">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = item.href === "/tenant"
              ? item.href === "/tenant"
              : item.href !== "/tenant" && item.href.startsWith("/tenant");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

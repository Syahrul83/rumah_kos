"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface SidebarProps {
  role: "super_admin" | "admin";
}

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin"] },
  { href: "/admin/rooms", label: "Kamar", icon: Home, roles: ["super_admin", "admin"] },
  { href: "/admin/tenants", label: "Penyewa", icon: Users, roles: ["super_admin", "admin"] },
  { href: "/admin/contracts", label: "Kontrak", icon: FileText, roles: ["super_admin", "admin"] },
  { href: "/admin/invoices", label: "Tagihan", icon: CreditCard, roles: ["super_admin", "admin"] },
  { href: "/admin/expenses", label: "Pengeluaran", icon: Package, roles: ["super_admin", "admin"] },
  { href: "/admin/reports", label: "Laporan", icon: BarChart3, roles: ["super_admin", "admin"] },
  { href: "/admin/users", label: "User", icon: UserCog, roles: ["super_admin"] },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings, roles: ["super_admin"] },
];

export default function AdminSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-30",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16">
        {!collapsed && (
          <Link href="/admin" className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary">Kost</span>
            <span className="text-xl font-bold text-secondary">Ku</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="text-xl font-bold text-primary mx-auto">K</Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8", collapsed && "ml-0")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* Menu */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {filtered.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border-l-3 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <Separator />
      <div className="p-3">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            KostKu v1.0
          </p>
        )}
      </div>
    </aside>
  );
}

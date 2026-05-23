import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "penghuni") {
    redirect("/tenant");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar role={user.role as "super_admin" | "admin"} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            Kelola Kost
          </h1>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/admin/notifications"
              className="p-2 rounded-lg hover:bg-muted transition-colors relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-xs">
                {user.full_name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span className="hidden md:block text-muted-foreground">
                {user.full_name}
              </span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

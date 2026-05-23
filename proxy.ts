import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const publicRoutes = ["/login", "/register", "/"];
const adminRoutes = ["/admin"];
const tenantRoutes = ["/tenant"];
const apiPublicRoutes = ["/api/midtrans/callback"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    apiPublicRoutes.some((r) => path.startsWith(r)) ||
    path.startsWith("/_next") ||
    path.startsWith("/api/midtrans")
  ) {
    return NextResponse.next();
  }

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  const isAuthenticated = !!data.user;

  if (publicRoutes.includes(path)) {
    if (isAuthenticated) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("user_id", data.user.id)
          .single();

        if (profile?.is_active && profile?.role) {
          const redirectMap: Record<string, string> = {
            super_admin: "/admin",
            admin: "/admin",
            penghuni: "/tenant",
          };
          const target = redirectMap[profile.role] ?? "/";
          return NextResponse.redirect(new URL(target, req.nextUrl));
        }
      } catch {
        // No profile yet — allow to stay on public page
      }
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("user_id", data.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("error", "banned");
      return NextResponse.redirect(loginUrl);
    }

    const isAdminPage = adminRoutes.some((r) => path.startsWith(r));
    const isTenantPage = tenantRoutes.some((r) => path.startsWith(r));

    if (isAdminPage && !["super_admin", "admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/tenant", req.nextUrl));
    }

    if (
      isAdminPage &&
      profile.role === "admin" &&
      (path.startsWith("/admin/users") || path.startsWith("/admin/settings"))
    ) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }

    if (isTenantPage && profile.role !== "penghuni") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/midtrans/callback).*)"],
};

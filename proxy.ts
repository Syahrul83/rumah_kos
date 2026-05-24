import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicRoutes = ["/login", "/register", "/"];
const adminRoutes = ["/admin"];
const tenantRoutes = ["/tenant"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/midtrans") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

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
          return NextResponse.redirect(new URL(redirectMap[profile.role] ?? "/", req.nextUrl));
        }
      } catch {
        // No profile — allow access to public page
      }
    }
    return supabaseResponse;
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
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (!profile.is_active) {
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

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/midtrans/callback).*)"],
};

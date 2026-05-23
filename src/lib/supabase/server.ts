import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored in Server Components
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}

export async function getUser() {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  return profile;
}

export async function getUserRole(): Promise<string | null> {
  const user = await getUser();
  return user?.role ?? null;
}

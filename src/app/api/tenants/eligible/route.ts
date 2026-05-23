import { NextRequest, NextResponse } from "next/server";
import { createSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const supabase = await createSupabase();

  let query = supabase
    .from("tenants")
    .select("id, full_name, phone, is_blacklisted, status")
    .eq("is_blacklisted", false)
    .neq("status", "aktif");

  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data } = await query.order("full_name").limit(20);
  return NextResponse.json(data ?? []);
}

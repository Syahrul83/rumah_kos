import { NextResponse } from "next/server";
import { createSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabase();
  const { data } = await supabase
    .from("rooms")
    .select("id, name, floor, price, status")
    .eq("status", "tersedia")
    .order("name");

  return NextResponse.json(data ?? []);
}

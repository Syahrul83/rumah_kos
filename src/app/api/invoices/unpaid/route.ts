import { NextResponse } from "next/server";
import { createSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabase();
  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, fine_amount, total_amount, status")
    .in("status", ["unpaid", "overdue"])
    .order("due_date", { ascending: true })
    .limit(50);

  return NextResponse.json(data ?? []);
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token || token !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch settings
  const { data: fineMethodRow } = await supabase.from("settings").select("value").eq("key", "fine_method").single();
  const { data: fineFixedRow } = await supabase.from("settings").select("value").eq("key", "fine_fixed_daily").single();
  const { data: finePctRow } = await supabase.from("settings").select("value").eq("key", "fine_percentage_daily").single();
  const { data: graceRow } = await supabase.from("settings").select("value").eq("key", "grace_period_days").single();

  const fineMethod = fineMethodRow?.value || "fixed";
  const fineFixed = parseInt(fineFixedRow?.value || "5000");
  const finePct = parseFloat(finePctRow?.value || "2");
  const gracePeriod = parseInt(graceRow?.value || "3");

  const today = new Date().toISOString().split("T")[0];

  // Get unpaid invoices past due date
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, amount, due_date, status")
    .in("status", ["unpaid"])
    .lt("due_date", today);

  let updated = 0;

  if (invoices) {
    for (const inv of invoices) {
      const due = new Date(inv.due_date);
      const now = new Date(today);
      const daysLate = Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

      if (daysLate > gracePeriod) {
        const fine = fineMethod === "fixed"
          ? daysLate * fineFixed
          : Math.round(inv.amount * (finePct / 100) * daysLate);

        await supabase.from("invoices").update({
          status: "overdue",
          fine_amount: fine,
          total_amount: inv.amount + fine,
        }).eq("id", inv.id);

        updated++;
      }
    }
  }

  return NextResponse.json({ success: true, updated, message: `${updated} invoices marked overdue` });
}

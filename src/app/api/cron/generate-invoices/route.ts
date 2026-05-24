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

  const { data: generateDayRow } = await supabase.from("settings").select("value").eq("key", "generate_day").single();
  const { data: dueDayRow } = await supabase.from("settings").select("value").eq("key", "due_day").single();

  const generateDay = parseInt(generateDayRow?.value || "1");
  const dueDay = parseInt(dueDayRow?.value || "10");

  const now = new Date();
  const today = now.getDate();

  // Only generate on the configured day
  if (today !== generateDay) {
    return NextResponse.json({ success: true, message: `Today is day ${today}, not ${generateDay}. Skipped.` });
  }

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const periodEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Get all active contracts
  const { data: contracts } = await supabase
    .from("rental_contracts")
    .select("id, tenant_id, monthly_price")
    .eq("status", "aktif");

  let generated = 0;

  if (contracts) {
    for (const c of contracts) {
      // Check if invoice for this period already exists
      const { count } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("contract_id", c.id)
        .eq("period_start", periodStart);

      if (count && count > 0) continue;

      const rand = Math.floor(Math.random() * 9000) + 1000;
      const invoiceNumber = `INV-${year}${String(month).padStart(2, "0")}-${rand}`;
      const dueDate = `${year}-${String(month).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`;

      const { error } = await supabase.from("invoices").insert({
        contract_id: c.id,
        tenant_id: c.tenant_id,
        invoice_number: invoiceNumber,
        period_start: periodStart,
        period_end: periodEnd,
        amount: c.monthly_price,
        fine_amount: 0,
        total_amount: c.monthly_price,
        due_date: dueDate,
        status: "unpaid",
      });

      if (error) {
        console.error("Invoice gen error:", error.message);
      } else {
        generated++;
        // Create notification
        await supabase.from("notifications").insert({
          user_id: (await supabase.from("tenants").select("user_id").eq("id", c.tenant_id).single()).data?.user_id || null,
          title: "Tagihan Baru Terbit",
          message: `Tagihan periode ${periodStart} s.d ${periodEnd} telah terbit. Batas bayar: ${dueDate}.`,
          type: "info",
        });
      }
    }
  }

  return NextResponse.json({ success: true, generated, message: `${generated} invoices generated` });
}

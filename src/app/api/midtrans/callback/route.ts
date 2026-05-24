import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/midtrans/snap";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      gross_amount,
      signature_key,
      transaction_id,
      payment_type,
      fraud_status,
      status_code,
    } = body;

    // 1. Verify signature
    if (!verifySignature(order_id, String(status_code), gross_amount, signature_key)) {
      return NextResponse.json({ status: "invalid signature" }, { status: 403 });
    }

    // 2. Admin client for bypassing RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Check idempotency
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("midtrans_order_id", order_id)
      .single();

    if (existing) {
      return NextResponse.json({ status: "already processed" });
    }

    // 4. Process based on status
    if (["settlement", "capture"].includes(transaction_status)) {
      // Success
      const { data: payment } = await supabase
        .from("payments")
        .select("invoice_id")
        .eq("midtrans_order_id", order_id)
        .maybeSingle();

      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: "settlement",
            midtrans_transaction_id: transaction_id,
            payment_method: payment_type || "midtrans",
          })
          .eq("midtrans_order_id", order_id);

        await supabase
          .from("invoices")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", payment.invoice_id);
      }
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      // Failed
      const { data: payment } = await supabase
        .from("payments")
        .select("invoice_id")
        .eq("midtrans_order_id", order_id)
        .maybeSingle();

      if (payment) {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("midtrans_order_id", order_id);

        await supabase
          .from("invoices")
          .update({ status: "unpaid" })
          .eq("id", payment.invoice_id);
      }
    } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
      // Refund
      await supabase
        .from("payments")
        .update({ status: "refund" })
        .eq("midtrans_order_id", order_id);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Midtrans callback error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

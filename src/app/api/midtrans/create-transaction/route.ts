import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/midtrans/snap";
import { createSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice_id } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: "invoice_id is required" }, { status: 400 });
    }

    const supabase = await createSupabase();

    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, tenants(full_name, phone, email)")
      .eq("id", invoice_id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice sudah lunas" }, { status: 400 });
    }

    if (invoice.status === "pending_payment") {
      return NextResponse.json({ error: "Pembayaran sedang diproses" }, { status: 400 });
    }

    // Lock invoice to prevent duplicate
    await supabase
      .from("invoices")
      .update({ status: "pending_payment" })
      .eq("id", invoice_id);

    const tenant = (invoice as any).tenants as { full_name: string; phone: string; email: string } | null;

    const orderId = `${invoice.invoice_number}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: invoice.total_amount,
      },
      customer_details: {
        first_name: tenant?.full_name || "Pelanggan",
        phone: tenant?.phone || "",
      },
      enabled_payments: ["bca_va", "bni_va", "bri_va", "mandiri_va", "gopay", "dana", "ovo", "shopeepay"],
    };

    const { token, redirect_url } = await createTransaction(parameter);

    // Save pending payment record
    await supabase.from("payments").insert({
      invoice_id: invoice_id,
      tenant_id: invoice.tenant_id,
      amount: invoice.total_amount,
      payment_method: "midtrans",
      midtrans_order_id: orderId,
      payment_date: new Date().toISOString().split("T")[0],
      status: "pending",
      notes: "Menunggu pembayaran Midtrans",
    });

    return NextResponse.json({ token, redirect_url, order_id: orderId });
  } catch (error: any) {
    console.error("Midtrans create transaction error:", error.message);
    return NextResponse.json(
      { error: error.message || "Gagal membuat transaksi" },
      { status: 500 }
    );
  }
}

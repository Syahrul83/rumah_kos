import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/midtrans/snap";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  try {
    const status = await getTransactionStatus(orderId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

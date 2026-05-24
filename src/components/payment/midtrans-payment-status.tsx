"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface MidtransPaymentStatusProps {
  orderId: string;
  initialStatus?: string;
}

export default function MidtransPaymentStatus({
  orderId,
  initialStatus,
}: MidtransPaymentStatusProps) {
  const [status, setStatus] = useState(initialStatus || "pending");
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/midtrans/status?order_id=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.transaction_status || data.status || status);
      }
    } catch {
      // ignore
    }
    setChecking(false);
  };

  useEffect(() => {
    if (status === "pending") {
      const timer = setInterval(checkStatus, 30000);
      return () => clearInterval(timer);
    }
  }, [status, orderId]);

  const statusBadge = () => {
    switch (status) {
      case "settlement":
      case "capture":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Lunas</Badge>;
      case "pending":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Menunggu</Badge>;
      case "deny":
      case "cancel":
      case "expire":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Gagal</Badge>;
      case "refund":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Refund</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <span className="text-sm text-muted-foreground">Status:</span>
      {statusBadge()}
      {status === "pending" && (
        <Button variant="ghost" size="sm" onClick={checkStatus} disabled={checking}>
          {checking ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          <span className="ml-1 text-xs">Cek</span>
        </Button>
      )}
    </div>
  );
}

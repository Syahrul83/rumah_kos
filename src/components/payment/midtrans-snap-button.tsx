"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MidtransSnapButtonProps {
  invoiceId: string;
  amount: number;
  invoiceNumber: string;
}

declare global {
  interface Window {
    snap: {
      embed: (token: string, options?: Record<string, unknown>) => void;
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

export default function MidtransSnapButton({
  invoiceId,
  amount,
  invoiceNumber,
}: MidtransSnapButtonProps) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const createAndOpen = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal membuat transaksi");
        setLoading(false);
        return;
      }

      setToken(data.token);

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            window.location.reload();
          },
          onPending: () => {
            toast.info("Pembayaran tertunda. Silakan selesaikan.");
            setTimeout(() => window.location.reload(), 3000);
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            setLoading(false);
          },
          onClose: () => {
            setLoading(false);
          },
        });
      } else {
        // Fallback: redirect to Midtrans page
        window.open(data.redirect_url, "_blank");
        toast.info("Lengkapi pembayaran di halaman Midtrans");
        setTimeout(() => window.location.reload(), 5000);
      }
    } catch {
      toast.error("Gagal menghubungkan ke Midtrans");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createAndOpen}
      disabled={loading}
      className="w-full bg-primary hover:bg-primary/90"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Bayar Sekarang — Rp {amount.toLocaleString("id-ID")}
        </>
      )}
    </Button>
  );
}

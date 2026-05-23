import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, Record<string, { label: string; className: string }>> = {
  room: {
    tersedia: { label: "Tersedia", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    terisi: { label: "Terisi", className: "bg-blue-50 text-blue-700 border-blue-200" },
    perbaikan: { label: "Perbaikan", className: "bg-amber-50 text-amber-700 border-amber-200" },
  },
  tenant: {
    aktif: { label: "Aktif", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    tidak_aktif: { label: "Tidak Aktif", className: "bg-gray-50 text-gray-600 border-gray-200" },
  },
  contract: {
    aktif: { label: "Aktif", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    selesai: { label: "Selesai", className: "bg-blue-50 text-blue-700 border-blue-200" },
    dibatalkan: { label: "Dibatalkan", className: "bg-red-50 text-red-700 border-red-200" },
  },
  invoice: {
    unpaid: { label: "Belum Bayar", className: "bg-amber-50 text-amber-700 border-amber-200" },
    paid: { label: "Lunas", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    overdue: { label: "Overdue", className: "bg-red-50 text-red-700 border-red-200" },
    pending_payment: { label: "Pending", className: "bg-blue-50 text-blue-700 border-blue-200" },
    cancelled: { label: "Batal", className: "bg-gray-50 text-gray-600 border-gray-200" },
  },
  payment: {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
    settlement: { label: "Settlement", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    failed: { label: "Gagal", className: "bg-red-50 text-red-700 border-red-200" },
    refund: { label: "Refund", className: "bg-purple-50 text-purple-700 border-purple-200" },
  },
};

interface StatusBadgeProps {
  type: keyof typeof statusConfig;
  status: string;
  className?: string;
}

export default function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

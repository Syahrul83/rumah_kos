"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: "danger" | "warning" | "default";
  confirmationWord?: string;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Hapus",
  variant = "danger",
  confirmationWord,
  onConfirm,
}: ConfirmDialogProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isDanger = variant === "danger";
  const needsTyping = !!confirmationWord;
  const canConfirm = needsTyping ? input === confirmationWord : true;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-full ${
                isDanger ? "bg-red-50" : "bg-amber-50"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  isDanger ? "text-destructive" : "text-amber-600"
                }`}
              />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>

        {needsTyping && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Ketik <span className="font-bold text-foreground">{confirmationWord}</span> untuk
              konfirmasi:
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={confirmationWord}
              className={isDanger ? "border-destructive/50" : ""}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant={isDanger ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? "Memproses..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

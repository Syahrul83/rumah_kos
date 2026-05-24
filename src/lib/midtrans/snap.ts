import "server-only";

let Snap: any = null;

function getSnap() {
  if (!Snap) {
    const midtransClient = require("midtrans-client");
    Snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_MODE === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });
  }
  return Snap;
}

export function createTransaction(parameter: Record<string, unknown>) {
  return new Promise<{ token: string; redirect_url: string }>((resolve, reject) => {
    getSnap().createTransaction(parameter, (error: Error | null, result: { token: string; redirect_url: string }) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

export function getTransactionStatus(orderId: string) {
  const midtransClient = require("midtrans-client");
  const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_MODE === "production",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  });

  return new Promise<any>((resolve, reject) => {
    coreApi.transaction.status(orderId, (error: Error | null, result: any) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

export function verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
  const crypto = require("crypto");
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const payload = orderId + statusCode + grossAmount + serverKey;
  const computed = crypto.createHash("sha512").update(payload).digest("hex");
  return computed === signatureKey;
}

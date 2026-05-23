import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-primary/5 p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-5xl font-bold">
            <span className="text-primary">Kost</span>
            <span className="text-secondary">Ku</span>
          </h1>
          <p className="text-muted-foreground mt-2">Manajemen Sewa Kost</p>
        </div>

        <p className="text-muted-foreground mb-8">
          Kelola kamar, penyewa, tagihan, dan pembayaran kost Anda dalam satu
          aplikasi modern.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}

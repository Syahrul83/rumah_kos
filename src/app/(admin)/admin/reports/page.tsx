import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, DollarSign, Home, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Laporan</h2>

      <Tabs defaultValue="finance">
        <TabsList>
          <TabsTrigger value="finance">Keuangan</TabsTrigger>
          <TabsTrigger value="tenants">Penghuni</TabsTrigger>
          <TabsTrigger value="occupancy">Okupansi</TabsTrigger>
        </TabsList>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Keuangan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Laporan keuangan akan ditampilkan setelah Supabase dikoneksikan dengan data real.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <DollarSign className="h-8 w-8 text-emerald-600 mb-2" />
                    <p className="text-2xl font-bold">Rp 0</p>
                    <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <ArrowUp className="h-8 w-8 text-destructive mb-2" />
                    <p className="text-2xl font-bold">Rp 0</p>
                    <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <ArrowDown className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">Rp 0</p>
                    <p className="text-sm text-muted-foreground">Laba Bersih</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2">
                <Link href="#">
                  <Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-2" />Export PDF</Button>
                </Link>
                <Link href="#">
                  <Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-2" />Export Excel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Penghuni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Total Penghuni</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-emerald-600 mb-2" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Aktif</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Tidak Aktif</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Okupansi Kamar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <Home className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground">Tingkat Okupansi</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

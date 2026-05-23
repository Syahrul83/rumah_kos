"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  searchable,
  onSearch,
  searchPlaceholder = "Cari...",
  loading,
  emptyMessage = "Tidak ada data.",
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      const timer = setTimeout(() => onSearch(value), 300);
      return () => clearTimeout(timer);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} dari {total}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              ←
            </button>
            {page > 1 && (
              <button
                onClick={() => onPageChange?.(1)}
                className="px-3 py-1 rounded border border-border hover:bg-muted"
              >
                1
              </button>
            )}
            <span className="px-3 py-1 rounded bg-primary text-primary-foreground">
              {page}
            </span>
            {page < totalPages && (
              <button
                onClick={() => onPageChange?.(totalPages)}
                className="px-3 py-1 rounded border border-border hover:bg-muted"
              >
                {totalPages}
              </button>
            )}
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

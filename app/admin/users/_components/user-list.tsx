"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserManageModal } from "./user-manage-modal";
import { format } from "date-fns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  getTierNameById,
  SubscriptionTier,
} from "@/constants/subscription-tiers";
import type { AdminUser } from "@/types/admin";
import Loading from "../loading";

interface UsersResponse {
  success: boolean;
  data: AdminUser[];
}

export function UserList() {
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", searchParams.toString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/users?${searchParams.toString()}`
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to fetch users");
      }
      const data = await response.json();
      console.log("API Response:", data);
      return data as UsersResponse;
    },
  });

  const users = response?.data ?? [];
  console.log("Users data:", users);

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "subscriptionTier",
      header: "Subscription",
      cell: ({ row }) => (
        <Badge variant='secondary'>
          {getTierNameById(row.original.subscriptionTier)}
        </Badge>
      ),
    },
    {
      accessorKey: "credits",
      header: "Credits",
      cell: ({ row }) => {
        const credits = row.original.credits;
        return (
          <div className='flex items-center gap-2'>
            <span
              className={`font-medium ${
                credits > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {credits}
            </span>
            <Badge
              variant={
                credits > 10
                  ? "default"
                  : credits > 0
                  ? "secondary"
                  : "destructive"
              }
              className='text-xs'
            >
              {credits > 10 ? "Good" : credits > 0 ? "Low" : "Empty"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              !status
                ? "secondary"
                : status === "active"
                ? "default"
                : status === "past_due" || status === "unpaid"
                ? "destructive"
                : status === "trialing"
                ? "default"
                : "secondary"
            }
          >
            {!status
              ? "Unknown"
              : status === "incomplete_expired"
              ? "Expired"
              : status.charAt(0).toUpperCase() +
                status.slice(1).replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => {
        const lastActive = row.original.lastActive;
        if (!lastActive) return "N/A";
        
        try {
          const date = new Date(lastActive);
          // Check if date is valid
          if (isNaN(date.getTime())) return "Invalid Date";
          return format(date, "PPp");
        } catch (error) {
          console.error("Error formatting date:", error);
          return "Invalid Date";
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return createdAt ? format(new Date(createdAt), "PPp") : "N/A";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant='outline'
          size='sm'
          onClick={() => setSelectedUser(row.original)}
        >
          Manage
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className='rounded-md bg-destructive/15 p-4'>
        <div className='flex'>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-destructive'>Error</h3>
            <div className='mt-2 text-sm text-destructive/80'>
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load users"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    <div className='flex items-center gap-2'>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <div className='w-4'>
                          {{
                            asc: <ChevronUp className='h-4 w-4' />,
                            desc: <ChevronDown className='h-4 w-4' />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className='h-4 w-4' />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between px-2 py-4'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
      </div>

      <UserManageModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}

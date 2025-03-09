"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser } from "@/types/admin";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Loading from "../loading";
import { UserManageModal } from "./user-manage-modal";
import { useAdminUsers } from "@/hooks/queries/use-admin-users";
import { SubscriptionTier } from "@/constants/subscription-tiers";

export function UserList() {
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Extract filter values from search params
  const filters = {
    tier: searchParams.get("tier") || "all",
    status: searchParams.get("status") || "all",
    minCredits: searchParams.get("minCredits") || "",
    maxCredits: searchParams.get("maxCredits") || "",
    search: searchParams.get("search") || "",
    lifetimeOnly: searchParams.get("lifetimeOnly") === "true",
  };

  // Use our new hook to fetch and filter users
  const { data: users, isLoading, error } = useAdminUsers(filters);

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => {
        const firstName = row.original.firstName || "";
        const lastName = row.original.lastName || "";
        return `${firstName} ${lastName}`.trim() || "N/A";
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "currentTier",
      header: "Subscription",
      cell: ({ row }) => (
        <Badge variant='secondary'>
          {row.original.currentTier?.name || "No Tier"}
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
              {credits > 4 ? "Good" : credits > 0 ? "Low" : "Empty"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.subscriptionStatus;
        return (
          <Badge
            variant={
              !status
                ? "secondary"
                : status === "ACTIVE"
                ? "default"
                : status === "PAST_DUE" || status === "UNPAID"
                ? "destructive"
                : status === "TRIALING"
                ? "default"
                : "secondary"
            }
          >
            {!status
              ? "Unknown"
              : status === "INCOMPLETE_EXPIRED"
              ? "Expired"
              : status.charAt(0).toUpperCase() +
                status.slice(1).replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Active",
      cell: ({ row }) => {
        const lastActive = row.original.lastLoginAt;
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
      accessorKey: "creditStatus",
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={`${
              filters.lifetimeOnly
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            } transition-opacity duration-200`}
          >
            Monthly Credits
            <ChevronsUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        const isLifetimePlan =
          user.subscription?.tier.tierId === SubscriptionTier.LIFETIME;

        if (!isLifetimePlan || !user.creditStatus) {
          return null;
        }

        const { receivedCurrentMonth, receivedLastMonth } = user.creditStatus;

        return (
          <div className='flex flex-col gap-1'>
            <div>
              {receivedCurrentMonth ? (
                <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                  Received This Month
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='bg-amber-100 text-amber-800 hover:bg-amber-100'
                >
                  Pending This Month
                </Badge>
              )}
            </div>
            <div>
              {receivedLastMonth ? (
                <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                  Received Last Month
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='bg-red-100 text-red-800 hover:bg-red-100'
                >
                  Missed Last Month
                </Badge>
              )}
            </div>
          </div>
        );
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
    data: users || [],
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

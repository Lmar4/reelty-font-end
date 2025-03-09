"use client";

import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { CreditLog } from "@/hooks/use-credits";

export default function CreditHistory() {
  const { userId } = useAuth();

  const { data: creditHistory, isLoading } = useQuery<CreditLog[]>({
    queryKey: ["credit-history", userId],
    queryFn: async () => {
      const response = await fetch(`/api/credits/history/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch credit history");
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <Skeleton className='h-48 w-full' />;
  }

  if (!creditHistory?.length) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No credit transactions found
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditHistory.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <span
                  className={log.amount > 0 ? "text-green-600" : "text-red-600"}
                >
                  {log.amount > 0 ? "+" : ""}
                  {log.amount}
                </span>
              </TableCell>
              <TableCell>{log.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

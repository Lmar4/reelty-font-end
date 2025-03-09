"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLifetimePlanStats, type LifetimePlanSubscriber } from "../actions";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function LifetimePlanSubscribers() {
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getLifetimePlanStats>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubscribers, setFilteredSubscribers] = useState<
    LifetimePlanSubscriber[]
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getLifetimePlanStats();
        setStats(data);
        setFilteredSubscribers(data.subscribers);
        setError(null);
      } catch (err) {
        setError("Failed to load lifetime plan subscribers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!stats) return;

    if (!searchTerm.trim()) {
      setFilteredSubscribers(stats.subscribers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = stats.subscribers.filter(
      (subscriber) =>
        subscriber.email.toLowerCase().includes(term) ||
        subscriber.name.toLowerCase().includes(term)
    );

    setFilteredSubscribers(filtered);
  }, [searchTerm, stats]);

  if (loading) {
    return <SubscribersTableSkeleton />;
  }

  if (error) {
    return (
      <Card className='bg-red-50 border-red-200'>
        <CardHeader>
          <CardTitle className='text-red-800'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-700'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <CardTitle>Lifetime Plan Subscribers</CardTitle>
            <CardDescription>
              All users with an active lifetime subscription plan
            </CardDescription>
          </div>
          <div className='relative w-full md:w-64'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search subscribers...'
              className='pl-8'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Credits Balance</TableHead>
                <TableHead>Current Month</TableHead>
                <TableHead>Last Month</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center py-6 text-muted-foreground'
                  >
                    {searchTerm
                      ? "No subscribers match your search"
                      : "No subscribers found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className='font-medium'>
                        {subscriber.name || "Unnamed User"}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {subscriber.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>
                        {subscriber.creditsBalance}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscriber.receivedCurrentMonth ? (
                        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                          Received (+{subscriber.currentMonthCredits})
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-amber-100 text-amber-800 hover:bg-amber-100'
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscriber.receivedLastMonth ? (
                        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                          Received (+{subscriber.lastMonthCredits})
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-red-100 text-red-800 hover:bg-red-100'
                        >
                          Missed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {format(new Date(subscriber.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscribersTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[200px]' />
        <Skeleton className='h-4 w-[300px] mt-1' />
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className='h-4 w-[80px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[80px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[80px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[80px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[80px]' />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className='h-5 w-[150px]' />
                      <Skeleton className='h-4 w-[180px] mt-1' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[40px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[80px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[80px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[100px]' />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

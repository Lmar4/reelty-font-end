"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditAgencyDialog } from "./edit-agency-dialog";
import { AgencyUser } from "@/app/admin/types";
import { formatDate } from "@/lib/utils";
import { AgencyUsersDialog } from "./agency-users-dialog";
import { CreditManagementDialog } from "./credit-management-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getAgencies } from "@/app/admin/actions";

export function AgencyManagementSection() {
  const [editingAgency, setEditingAgency] = useState<AgencyUser | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<AgencyUser | null>(null);
  const [managingCredits, setManagingCredits] = useState<AgencyUser | null>(
    null
  );

  const { data: agencies, isLoading } = useQuery({
    queryKey: ["agencies"],
    queryFn: getAgencies,
  });

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <Skeleton className='h-7 w-[200px]' />
            <Skeleton className='h-4 w-[300px] mt-2' />
          </div>
          <Skeleton className='h-10 w-[120px]' />
        </div>

        <div className='border rounded-lg'>
          <div className='relative w-full overflow-auto'>
            <table className='w-full caption-bottom text-sm'>
              <thead className='[&_tr]:border-b'>
                <tr className='border-b transition-colors'>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <th key={i} className='h-12 px-4 text-left align-middle'>
                      <Skeleton className='h-4 w-[80px]' />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='[&_tr:last-child]:border-0'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='border-b transition-colors'>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <td key={i} className='p-4'>
                        <Skeleton className='h-4 w-[100px]' />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold'>Agency Management</h2>
          <p className='text-muted-foreground'>
            Manage agency accounts and their users
          </p>
        </div>
        <Button onClick={() => setEditingAgency({} as AgencyUser)}>
          Create Agency
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agency Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies?.map((agency: AgencyUser) => (
            <TableRow key={agency.id}>
              <TableCell className='font-medium'>{agency.agencyName}</TableCell>
              <TableCell>{agency.email}</TableCell>
              <TableCell>
                {agency.agencyCurrentUsers ?? 0} / {agency.agencyMaxUsers ?? 1}
              </TableCell>
              <TableCell>
                <Badge variant='outline'>
                  {agency.totalCredits || 0} credits
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    (agency.agencyCurrentUsers ?? 0) <
                    (agency.agencyMaxUsers ?? 1)
                      ? "default"
                      : "secondary"
                  }
                >
                  {(agency.agencyCurrentUsers ?? 0) <
                  (agency.agencyMaxUsers ?? 1)
                    ? "Active"
                    : "Full"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(agency.createdAt)}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    onClick={() => setEditingAgency(agency)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={() => setSelectedAgency(agency)}
                  >
                    View Users
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={() => setManagingCredits(agency)}
                  >
                    Manage Credits
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditAgencyDialog
        agency={editingAgency}
        open={!!editingAgency}
        onClose={() => setEditingAgency(null)}
      />

      <AgencyUsersDialog
        agency={selectedAgency}
        open={!!selectedAgency}
        onClose={() => setSelectedAgency(null)}
      />

      <CreditManagementDialog
        agency={managingCredits}
        open={!!managingCredits}
        onClose={() => setManagingCredits(null)}
      />
    </div>
  );
}

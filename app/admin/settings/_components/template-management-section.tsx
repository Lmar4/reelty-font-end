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
import { Template as PrismaTemplate } from "@/types/prisma-types";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { EditTemplateDialog } from "./edit-template-dialog";
import { unwrapApiResponse } from "@/utils/unwrapApiResponse";

interface Template extends PrismaTemplate {
  sequence: (string | number)[];
  durations: number[] | Record<string, number>;
  music?: {
    path: string;
    volume?: number;
    startTime?: number;
  };
  transitions?: {
    type: "crossfade" | "fade" | "slide";
    duration: number;
  }[];
}

export function TemplateManagementSection() {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();

      // Unwrap the API response to get the actual templates data
      const unwrappedData = unwrapApiResponse<PrismaTemplate[]>(data);

      // Transform the data to ensure it matches the Template interface
      return (unwrappedData || []).map((template: any) => {
        // Ensure sequence is an array of string or number
        const sequence = Array.isArray(template.sequence)
          ? template.sequence
          : template.sequence
          ? [template.sequence]
          : [];

        // Ensure durations is an array or object
        const durations = Array.isArray(template.durations)
          ? template.durations
          : typeof template.durations === "object"
          ? template.durations
          : [];

        return {
          ...template,
          sequence,
          durations,
          // Add other required properties with defaults if needed
          music: template.music || undefined,
          transitions: template.transitions || undefined,
        } as Template;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "tiers",
      header: "Tiers",
      cell: ({ row }) => {
        const tiers = row.original.tiers;
        return (
          <div className='flex gap-2'>
            {tiers.map((tier) => (
              <Badge key={tier} variant='outline'>
                {tier}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "thumbnailUrl",
      header: "Thumbnail",
      cell: ({ row }) => {
        const thumbnailUrl = row.original.thumbnailUrl;
        return thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={row.original.name}
            className='w-20 h-20 object-cover'
          />
        ) : (
          <div className='w-20 h-20 bg-gray-100 flex items-center justify-center'>
            No thumbnail
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => format(new Date(row.original.createdAt), "PPP"),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => format(new Date(row.original.updatedAt), "PPP"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => {
              setEditingTemplate(row.original);
              setIsDialogOpen(true);
            }}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCloseDialog = () => {
    setEditingTemplate(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <div className='flex justify-between items-center'>
          <div className='animate-pulse bg-gray-200 h-8 w-48 rounded' />
          <div className='animate-pulse bg-gray-200 h-10 w-32 rounded' />
        </div>

        <div className='space-y-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='animate-pulse bg-gray-200 h-16 w-full rounded'
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Video Templates</h2>
        <Button
          onClick={() => {
            setEditingTemplate(null);
            setIsDialogOpen(true);
          }}
        >
          Add Template
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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

      <EditTemplateDialog
        template={editingTemplate}
        open={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}

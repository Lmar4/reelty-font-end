"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Asset } from "@/types/prisma-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  FileVideo,
  Image as ImageIcon,
  Loader2,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { EditAssetDialog } from "./edit-asset-dialog";

type AssetTypeInfo = {
  label: string;
  icon: JSX.Element;
  variant: "default" | "secondary" | "outline";
};

const ASSET_TYPES: Record<string, AssetTypeInfo> = {
  MUSIC: {
    label: "Music",
    icon: <PlayCircle className='w-4 h-4' />,
    variant: "default",
  },
  WATERMARK: {
    label: "Watermark",
    icon: <ImageIcon className='w-4 h-4' />,
    variant: "secondary",
  },
  LOTTIE: {
    label: "Lottie",
    icon: <FileVideo className='w-4 h-4' />,
    variant: "outline",
  },
};

export function AssetManagementSection() {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const columns = useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = ASSET_TYPES[row.original.type];
          return (
            <Badge variant={type.variant} className='flex items-center gap-1'>
              {type.icon}
              {type.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        id: "preview",
        header: "Preview",
        cell: ({ row }) => {
          const asset = row.original;
          if (asset.type === "MUSIC") {
            const isPlaying = playingAudio === asset.id;
            return (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleAudioToggle(asset)}
              >
                {isPlaying ? (
                  <PauseCircle className='w-5 h-5' />
                ) : (
                  <PlayCircle className='w-5 h-5' />
                )}
              </Button>
            );
          }
          if (asset.type === "WATERMARK") {
            return asset.filePath ? (
              <img
                src={asset.filePath}
                alt={asset.name}
                className='w-20 h-12 object-contain rounded'
              />
            ) : null;
          }
          if (asset.type === "LOTTIE") {
            return (
              <div className='text-sm text-muted-foreground'>
                Lottie Animation
              </div>
            );
          }
          return null;
        },
      },
      {
        accessorKey: "tier.name",
        header: "Subscription Tier",
        cell: ({ row }) => (
          <Badge variant='outline'>
            {row.original.subscriptionTier?.name || "Unknown"}
          </Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "destructive"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => format(new Date(row.original.createdAt), "PPp"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant='ghost'
            onClick={() => {
              setEditingAsset(row.original);
              setIsDialogOpen(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [playingAudio]
  );

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await fetch("/api/admin/assets/assets");
      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }
      const data = await response.json();
      return data.data || [];
    },
  });

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesType = typeFilter === "ALL" || asset.type === typeFilter;
      const matchesSearch =
        !searchQuery ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );
      return matchesType && matchesSearch;
    });
  }, [assets, typeFilter, searchQuery]);

  const table = useReactTable({
    data: filteredAssets,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleAudioToggle = useCallback(
    (asset: Asset) => {
      if (playingAudio === asset.id) {
        setPlayingAudio(null);
        // Stop audio logic here
      } else {
        setPlayingAudio(asset.id);
        // Play audio logic here
      }
    },
    [playingAudio]
  );

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Assets</h2>
        <Button
          onClick={() => {
            setEditingAsset(null);
            setIsDialogOpen(true);
          }}
        >
          Add Asset
        </Button>
      </div>

      <div className='flex gap-4 mb-6'>
        <div className='w-[200px]'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Types</SelectItem>
              {Object.entries(ASSET_TYPES).map(([value, { label, icon }]) => (
                <SelectItem
                  key={value}
                  value={value}
                  className='flex items-center gap-2'
                >
                  {icon}
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex-1'>
          <Input
            placeholder='Search assets...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className='space-y-4 p-6'>
          <div className='flex justify-between items-center'>
            <div className='animate-pulse bg-gray-200 h-8 w-48 rounded' />
            <div className='animate-pulse bg-gray-200 h-10 w-32 rounded' />
          </div>
          <div className='space-y-2'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='animate-pulse bg-gray-200 h-16 w-full rounded'
              />
            ))}
          </div>
        </div>
      ) : (
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
      )}

      <EditAssetDialog
        asset={editingAsset}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

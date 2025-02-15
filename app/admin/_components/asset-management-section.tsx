"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Asset,
  AssetType,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/types/asset-types";
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
} from "@/hooks/queries/use-assets";

// Define the asset types array for the select options
const ASSET_TYPES: AssetType[] = ["MUSIC", "WATERMARK", "LOTTIE"];

interface AssetManagementSectionProps {
  initialAssets: Asset[];
}

export default function AssetManagementSection({
  initialAssets,
}: AssetManagementSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType | undefined>();
  const { toast } = useToast();

  const { data: assets, isLoading } = useAssets({
    initialData: initialAssets,
    type: selectedType,
    includeInactive,
  });

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("filePath") as File;

    if (!file) {
      toast({
        title: "Error",
        description: "File is required",
        variant: "destructive",
      });
      return;
    }

    const data: CreateAssetInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as AssetType,
      subscriptionTier: formData.get("subscriptionTier") as string,
      file,
    };

    try {
      await createAsset.mutateAsync(data);
      toast({
        title: "Success",
        description: "Asset created successfully",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create asset",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await updateAsset.mutateAsync({
        id,
        isActive: !currentState,
      } as UpdateAssetInput);
      toast({
        title: "Success",
        description: "Asset updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update asset",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAsset.mutateAsync(id);
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Asset Management</h2>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Switch
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
              id='include-inactive'
            />
            <Label htmlFor='include-inactive'>Show Inactive</Label>
          </div>
          <Select
            value={selectedType}
            onValueChange={(value) =>
              setSelectedType(value ? (value as AssetType) : undefined)
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All Types</SelectItem>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Add Asset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input id='name' name='name' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea id='description' name='description' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='filePath'>File</Label>
                  <Input id='filePath' name='filePath' type='file' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='type'>Type</Label>
                  <Select name='type' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a type' />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='subscriptionTier'>Subscription Tier</Label>
                  <Select name='subscriptionTier' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a tier' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='free'>Free</SelectItem>
                      <SelectItem value='pro'>Pro</SelectItem>
                      <SelectItem value='enterprise'>Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type='submit' disabled={createAsset.isPending}>
                  {createAsset.isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Create Asset
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subscription Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets?.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.description}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{asset.subscriptionTier}</TableCell>
                <TableCell>
                  <Switch
                    checked={asset.isActive}
                    onCheckedChange={() =>
                      handleToggleActive(asset.id, asset.isActive)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDelete(asset.id)}
                    disabled={deleteAsset.isPending}
                  >
                    {deleteAsset.isPending && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

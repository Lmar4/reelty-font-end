"use client";

import { FileUploader } from "@/components/shared/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Asset, SubscriptionTier } from "@/types/prisma-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileVideo,
  Image as ImageIcon,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ASSET_TYPES = {
  MUSIC: {
    label: "Music",
    icon: <PlayCircle className='w-4 h-4' />,
    accept: "audio/*",
  },
  WATERMARK: {
    label: "Watermark",
    icon: <ImageIcon className='w-4 h-4' />,
    accept: "image/*",
  },
  LOTTIE: {
    label: "Lottie",
    icon: <FileVideo className='w-4 h-4' />,
    accept: ".json,application/json",
  },
} as const;

interface EditAssetDialogProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
}

export function EditAssetDialog({
  asset,
  open,
  onClose,
}: EditAssetDialogProps) {
  const [formData, setFormData] = useState<Partial<Asset>>(
    asset || {
      name: "",
      description: "",
      type: "MUSIC",
      isActive: true,
    }
  );
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const queryClient = useQueryClient();

  const { data: tiersResponse } = useQuery<{
    success: boolean;
    data: SubscriptionTier[];
  }>({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subscription-tiers");
      if (!response.ok) throw new Error("Failed to fetch subscription tiers");
      return response.json();
    },
  });

  const tiers = tiersResponse?.data || [];

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = asset ? `/api/admin/assets/${asset.id}` : "/api/admin/assets";
      const method = asset ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed to save asset");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success(`Asset ${asset ? "updated" : "created"} successfully`);
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = async (file: File | null) => {
    setFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });

      if (file) {
        formDataToSend.append("file", file);
      }

      await mutation.mutateAsync(formDataToSend);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFormData(
      asset || {
        name: "",
        description: "",
        type: "MUSIC",
        isActive: true,
      }
    );
    setFile(null);
    setPreviewUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  const handleAudioToggle = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor='type'>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as Asset["type"] })
                }
                disabled={!!asset}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPES).map(
                    ([value, { label, icon }]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className='flex flex-col items-start gap-1'
                      >
                        <span className='flex items-center gap-2'>
                          {icon}
                          <span>{label}</span>
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='tier'>Subscription Tier</Label>
              <Select
                value={formData.subscriptionTier}
                onValueChange={(value) =>
                  setFormData({ ...formData, subscriptionTier: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a tier' />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='isActive'>Active</Label>
              <Switch
                id='isActive'
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div>
              <Label>File</Label>
              <FileUploader
                accept={
                  ASSET_TYPES[formData.type as keyof typeof ASSET_TYPES].accept
                }
                onFileSelect={handleFileChange}
              />
            </div>

            {previewUrl && (
              <div className='mt-4'>
                <Label>Preview</Label>
                <div className='mt-2'>
                  {formData.type === "MUSIC" && (
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={handleAudioToggle}
                      >
                        {isPlaying ? (
                          <PauseCircle className='w-6 h-6' />
                        ) : (
                          <PlayCircle className='w-6 h-6' />
                        )}
                      </Button>
                      <audio
                        ref={audioRef}
                        src={previewUrl}
                        onEnded={() => setIsPlaying(false)}
                        className='hidden'
                      />
                      <span className='text-sm'>{file?.name}</span>
                    </div>
                  )}
                  {formData.type === "WATERMARK" && (
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='max-w-full h-auto rounded'
                    />
                  )}
                  {formData.type === "LOTTIE" && (
                    <div className='text-sm text-muted-foreground'>
                      Lottie animation preview not available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isUploading}>
              {isUploading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

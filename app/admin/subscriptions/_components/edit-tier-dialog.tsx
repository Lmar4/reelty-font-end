"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { SubscriptionTier } from "@/types/prisma-types";

const tierSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  monthlyPrice: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  creditExpirationDays: z.coerce
    .number()
    .min(1, "Credit expiration must be at least 1 day")
    .max(365, "Credit expiration cannot exceed 365 days"),
  creditRolloverMonths: z.coerce
    .number()
    .min(0, "Credit rollover cannot be negative")
    .max(12, "Credit rollover cannot exceed 12 months"),
  hasWatermark: z.boolean(),
  maxPhotosPerListing: z.coerce
    .number()
    .min(1, "Must allow at least 1 photo per listing")
    .max(100, "Cannot exceed 100 photos per listing"),
  maxReelDownloads: z.union([
    z.coerce.number().min(1, "Must allow at least 1 download"),
    z.literal(null).transform(() => null),
  ]),
  maxActiveListings: z.coerce
    .number()
    .min(1, "Must allow at least 1 active listing")
    .max(1000, "Cannot exceed 1000 active listings"),
});

type TierFormData = z.infer<typeof tierSchema>;

interface EditTierDialogProps {
  tier: SubscriptionTier | null;
  open: boolean;
  onClose: () => void;
}

// Extract form fields into a separate component
function TierFormFields({ form }: { form: UseFormReturn<TierFormData> }) {
  return (
    <div className='space-y-4'>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Enter tier name' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder='Enter tier description'
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='monthlyPrice'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Price</FormLabel>
            <FormControl>
              <div className='relative flex items-center'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                  $
                </span>
                <Input
                  {...field}
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  className='pl-7'
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className='my-4' />
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='creditExpirationDays'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Expiration (Days)</FormLabel>
              <FormControl>
                <Input {...field} type='number' min={1} max={365} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='creditRolloverMonths'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Rollover (Months)</FormLabel>
              <FormControl>
                <Input {...field} type='number' min={0} max={12} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className='my-4' />
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='maxPhotosPerListing'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Photos per Listing</FormLabel>
              <FormControl>
                <Input {...field} type='number' min={1} max={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='maxActiveListings'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Active Listings</FormLabel>
              <FormControl>
                <Input {...field} type='number' min={1} max={1000} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className='my-4' />
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='maxReelDownloads'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Reel Downloads</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='number'
                  min={1}
                  placeholder='Leave empty for unlimited'
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? null : parseInt(value, 10));
                  }}
                  value={field.value === null ? "" : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='hasWatermark'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel>Watermark</FormLabel>
                <FormDescription>
                  Apply watermark to generated videos
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Extract features section into a separate component
function FeaturesSection({
  features,
  newFeature,
  setNewFeature,
  handleAddFeature,
  handleRemoveFeature,
  form,
}: {
  features: string[];
  newFeature: string;
  setNewFeature: (value: string) => void;
  handleAddFeature: () => void;
  handleRemoveFeature: (index: number) => void;
  form: UseFormReturn<TierFormData>;
}) {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <FormLabel>Features</FormLabel>
        <Badge variant='secondary'>{features.length} features</Badge>
      </div>
      <div className='flex gap-2'>
        <Input
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          placeholder='Add a feature'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddFeature();
            }
          }}
        />
        <Button
          type='button'
          onClick={handleAddFeature}
          disabled={!newFeature.trim()}
        >
          Add
        </Button>
      </div>

      <ul className='space-y-2'>
        {features.map((feature, index) => (
          <li
            key={index}
            className='flex items-center justify-between bg-secondary p-2 rounded'
          >
            <span>{feature}</span>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => handleRemoveFeature(index)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <FormMessage>{form.formState.errors.features?.message}</FormMessage>
    </div>
  );
}

// Extract mutation logic into a custom hook
function useTierMutation(tier: SubscriptionTier | null, onClose: () => void) {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionTier, Error, TierFormData>({
    mutationFn: async (data: TierFormData) => {
      // Get the ID safely handling both object structures
      const tierId = tier?.id;

      const response = await fetch(`/api/admin/subscription-tiers/${tierId}`, {
        method: tierId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription tier");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-tiers"] });
      toast.success(
        tier ? "Tier updated successfully" : "Tier created successfully"
      );
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save subscription tier"
      );
    },
  });
}

export function EditTierDialog({ tier, open, onClose }: EditTierDialogProps) {
  const [features, setFeatures] = useState<string[]>(tier?.features || []);
  const [newFeature, setNewFeature] = useState("");

  const form = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      name: tier?.name || "",
      description: tier?.description || "",
      monthlyPrice: tier?.monthlyPrice || 0,
      features: tier?.features || [],
      creditExpirationDays: tier?.creditExpirationDays || 30,
      creditRolloverMonths: tier?.creditRolloverMonths || 0,
      hasWatermark: tier?.hasWatermark ?? true,
      maxPhotosPerListing: tier?.maxPhotosPerListing || 10,
      maxReelDownloads: tier?.maxReelDownloads || null,
      maxActiveListings: tier?.maxActiveListings || 5,
    },
  });

  // Reset form values when tier changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: tier?.name || "",
        description: tier?.description || "",
        monthlyPrice: tier?.monthlyPrice || 0,
        features: tier?.features || [],
        creditExpirationDays: tier?.creditExpirationDays || 30,
        creditRolloverMonths: tier?.creditRolloverMonths || 0,
        hasWatermark: tier?.hasWatermark ?? true,
        maxPhotosPerListing: tier?.maxPhotosPerListing || 10,
        maxReelDownloads: tier?.maxReelDownloads || null,
        maxActiveListings: tier?.maxActiveListings || 5,
      });
      setFeatures(tier?.features || []);
    }
  }, [tier, open, form]);

  const mutation = useTierMutation(tier, onClose);
  const isLoading = mutation.isPending;

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      form.setValue("features", [...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    form.setValue("features", updatedFeatures);
  };

  const onSubmit = (data: TierFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>
            {tier?.id ? "Edit Subscription Tier" : "Create New Tier"}
          </DialogTitle>
          <DialogDescription>
            Configure the subscription tier settings and features.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <ScrollArea className='max-h-[60vh] pr-4'>
              <div className='space-y-6'>
                <TierFormFields form={form} />

                <FeaturesSection
                  features={features}
                  newFeature={newFeature}
                  setNewFeature={setNewFeature}
                  handleAddFeature={handleAddFeature}
                  handleRemoveFeature={handleRemoveFeature}
                  form={form}
                />
              </div>
            </ScrollArea>

            <div className='flex justify-end gap-4 pt-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

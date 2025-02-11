"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SubscriptionTier } from "@/types/prisma-types";

const tierSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  monthlyPrice: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
  features: z.array(z.string()).min(1, "At least one feature is required"),
});

type TierFormData = z.infer<typeof tierSchema>;

interface EditTierDialogProps {
  tier: SubscriptionTier | null;
  open: boolean;
  onClose: () => void;
}

export function EditTierDialog({ tier, open, onClose }: EditTierDialogProps) {
  const [features, setFeatures] = useState<string[]>(tier?.features || []);
  const [newFeature, setNewFeature] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      name: tier?.name || "",
      description: tier?.description || "",
      monthlyPrice: tier?.monthlyPrice || 0,
      features: tier?.features || [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TierFormData) => {
      const response = await fetch(
        `/api/admin/subscription-tiers/${tier?.id || ""}`,
        {
          method: tier?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save subscription tier");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-tiers"] });
      toast.success(
        tier?.id ? "Tier updated successfully" : "Tier created successfully"
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
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {tier?.id ? "Edit Subscription Tier" : "Create New Tier"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
                    <Input
                      {...field}
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-4'>
              <FormLabel>Features</FormLabel>
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
                <Button type='button' onClick={handleAddFeature}>
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
              <FormMessage>
                {form.formState.errors.features?.message}
              </FormMessage>
            </div>

            <div className='flex justify-end gap-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

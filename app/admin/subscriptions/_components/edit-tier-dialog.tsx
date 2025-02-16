"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionTier } from "@/types/prisma-types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  monthlyPrice: z.number().min(0, "Price must be greater than or equal to 0"),
  planType: z.enum(["PAY_AS_YOU_GO", "MONTHLY"]),
  creditsPerInterval: z.number().min(0),
  maxPhotosPerListing: z
    .number()
    .min(1, "Must allow at least 1 photo per listing"),
  maxActiveListings: z.number().min(1, "Must allow at least 1 active listing"),
  hasWatermark: z.boolean(),
  premiumTemplatesEnabled: z.boolean(),
  features: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTierDialogProps {
  tier: SubscriptionTier | null;
  open: boolean;
  onClose: () => void;
}

export function EditTierDialog({ tier, open, onClose }: EditTierDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      monthlyPrice: 0,
      planType: "PAY_AS_YOU_GO",
      creditsPerInterval: 0,
      maxPhotosPerListing: 10,
      maxActiveListings: 5,
      hasWatermark: true,
      premiumTemplatesEnabled: false,
      features: [],
    },
  });

  useEffect(() => {
    if (tier) {
      form.reset({
        name: tier.name,
        description: tier.description,
        monthlyPrice: tier.monthlyPrice,
        planType: tier.planType,
        creditsPerInterval: tier.creditsPerInterval,
        maxPhotosPerListing: tier.maxPhotosPerListing,
        maxActiveListings: tier.maxActiveListings,
        hasWatermark: tier.hasWatermark,
        premiumTemplatesEnabled: tier.premiumTemplatesEnabled,
        features: tier.features,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        monthlyPrice: 0,
        planType: "PAY_AS_YOU_GO",
        creditsPerInterval: 0,
        maxPhotosPerListing: 10,
        maxActiveListings: 5,
        hasWatermark: true,
        premiumTemplatesEnabled: false,
        features: [],
      });
    }
  }, [tier, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/admin/subscription-tiers${tier ? `/${tier.id}` : ""}`,
        {
          method: tier ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
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
        tier ? "Subscription tier updated" : "New subscription tier created"
      );
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {tier ? "Edit Subscription Tier" : "Create New Tier"}
          </DialogTitle>
          <DialogDescription>
            {tier
              ? "Update the details of this subscription tier"
              : "Create a new subscription tier with custom features"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[600px] pr-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='planType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select plan type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='PAY_AS_YOU_GO'>
                            Pay As You Go
                          </SelectItem>
                          <SelectItem value='MONTHLY'>
                            Monthly Subscription
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='monthlyPrice'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='creditsPerInterval'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Number of credits included in this plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maxPhotosPerListing'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Photos per Listing</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Features & Limitations</h3>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='hasWatermark'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>Watermark</FormLabel>
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

                  <FormField
                    control={form.control}
                    name='premiumTemplatesEnabled'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            Premium Templates
                          </FormLabel>
                          <FormDescription>
                            Access to premium video templates
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

                <FormField
                  control={form.control}
                  name='maxActiveListings'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Active Listings</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of active listings allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='pt-4'>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {tier ? "Update Tier" : "Create Tier"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

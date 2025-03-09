"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AgencyUser } from "@/app/admin/types";

const creditSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Amount must be at least 1")
    .max(10000, "Amount cannot exceed 10,000"),
  operation: z.enum(["add", "remove"]),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type CreditFormData = z.infer<typeof creditSchema>;

interface CreditManagementDialogProps {
  agency: AgencyUser | null;
  open: boolean;
  onClose: () => void;
}

export function CreditManagementDialog({
  agency,
  open,
  onClose,
}: CreditManagementDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreditFormData>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      amount: 0,
      operation: "add",
      reason: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreditFormData) => {
      const response = await fetch(
        `/api/admin/agencies/${agency?.id}/credits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            amount:
              data.operation === "add" ? data.amount : -Math.abs(data.amount),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update credits");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agency-users", agency?.id],
      });
      toast.success("Credits updated successfully");
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update credits"
      );
    },
  });

  const onSubmit = (data: CreditFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Manage Credits - {agency?.agencyName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='operation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select operation' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='add'>Add Credits</SelectItem>
                      <SelectItem value='remove'>Remove Credits</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      min='1'
                      max='10000'
                      placeholder='Enter amount'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select reason' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='bonus'>Bonus Credits</SelectItem>
                      <SelectItem value='compensation'>Compensation</SelectItem>
                      <SelectItem value='adjustment'>
                        Account Adjustment
                      </SelectItem>
                      <SelectItem value='promotion'>Promotion</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Additional notes about this credit update'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update Credits"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

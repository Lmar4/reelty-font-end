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
import { AgencyUser } from "@/types/agency";

const agencySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  ownerEmail: z.string().email("Invalid email address"),
  maxUsers: z.coerce.number().min(1, "Must allow at least 1 user"),
  initialCredits: z.coerce.number().min(0, "Credits cannot be negative"),
});

type AgencyFormData = z.infer<typeof agencySchema>;

interface EditAgencyDialogProps {
  agency: AgencyUser | null;
  open: boolean;
  onClose: () => void;
}

export function EditAgencyDialog({
  agency,
  open,
  onClose,
}: EditAgencyDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: agency?.agencyName || "",
      ownerEmail: agency?.email || "",
      maxUsers: agency?.agencyMaxUsers || 1,
      initialCredits: agency?.totalCredits || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AgencyFormData) => {
      const response = await fetch(`/api/admin/agencies/${agency?.id || ""}`, {
        method: agency?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save agency");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success(
        agency?.id
          ? "Agency updated successfully"
          : "Agency created successfully"
      );
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save agency"
      );
    },
  });

  const onSubmit = (data: AgencyFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {agency?.id ? "Edit Agency" : "Create New Agency"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter agency name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ownerEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Enter owner email'
                      disabled={!!agency?.id}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='maxUsers'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Users</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      min='1'
                      placeholder='Enter maximum number of users'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!agency?.id && (
              <FormField
                control={form.control}
                name='initialCredits'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Credits</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        min='0'
                        placeholder='Enter initial credits'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

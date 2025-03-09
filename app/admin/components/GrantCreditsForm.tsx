"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { grantUserCredits } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  creditsAmount: z.coerce
    .number()
    .int()
    .positive("Credits must be a positive number"),
  reason: z.string().min(1, "Reason is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface GrantCreditsFormProps {
  adminId: string;
  adminName: string;
}

export function GrantCreditsForm({
  adminId,
  adminName,
}: GrantCreditsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      creditsAmount: 1,
      reason: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      const result = await grantUserCredits({
        userId: values.userId,
        creditsAmount: values.creditsAmount,
        reason: values.reason,
        adminId,
        adminName,
      });

      if (result.success) {
        toast.success("Credits granted successfully", {
          description: `${values.creditsAmount} credits granted to user ${values.userId}`,
        });
        form.reset();
      } else {
        toast.error("Failed to grant credits", {
          description: result.error || "An unknown error occurred",
        });
      }
    } catch (error) {
      toast.error("Failed to grant credits", {
        description: (error as Error).message || "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Credits</CardTitle>
        <CardDescription>
          Grant credits to a user. The user will receive an email notification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='userId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter user ID' {...field} />
                  </FormControl>
                  <FormDescription>
                    The ID of the user to grant credits to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='creditsAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits Amount</FormLabel>
                  <FormControl>
                    <Input type='number' min='1' {...field} />
                  </FormControl>
                  <FormDescription>Number of credits to grant</FormDescription>
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
                  <FormControl>
                    <Textarea
                      placeholder='Enter reason for granting credits'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be recorded in the admin logs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? "Granting Credits..." : "Grant Credits"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

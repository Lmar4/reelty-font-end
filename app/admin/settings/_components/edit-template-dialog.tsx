"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useSubscriptionTiers } from "@/hooks/queries/use-subscription-tiers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Template as PrismaTemplate,
  SubscriptionTier,
} from "@/types/prisma-types";

const transitionSchema = z.object({
  type: z.enum(["crossfade", "fade", "slide"]),
  duration: z.number().min(0.1).max(5),
});

const musicSchema = z.object({
  path: z.string().min(1, "Music path is required"),
  volume: z.number().min(0).max(1).optional(),
  startTime: z.number().min(0).optional(),
});

const templateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sequence: z
    .array(z.union([z.number(), z.string()]))
    .min(1, "At least one sequence item is required"),
  durations: z.union([
    z.array(z.number().min(0.1)),
    z.record(z.string(), z.number().min(0.1)),
  ]),
  music: musicSchema.optional(),
  transitions: z.array(transitionSchema).optional(),
  tiers: z.array(z.string()).min(1, "At least one tier must be selected"),
  thumbnailUrl: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

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

interface EditTemplateDialogProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
}

function TierCheckboxes({ form }: { form: any }) {
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

  return (
    <FormField
      control={form.control}
      name='tiers'
      render={() => (
        <FormItem>
          <div className='mb-4'>
            <FormLabel>Available Tiers</FormLabel>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            {tiers?.map((tier: { id: string; name: string }) => (
              <FormField
                key={tier.id}
                control={form.control}
                name='tiers'
                render={({ field }) => {
                  return (
                    <FormItem
                      key={tier.id}
                      className='flex flex-row items-start space-x-3 space-y-0'
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(tier.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([
                                  ...(field.value || []),
                                  tier.id,
                                ])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== tier.id
                                  ) || []
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className='font-normal'>{tier.name}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SequenceSection({ form }: { form: any }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "sequence",
  });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <FormLabel>Sequence</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => append(fields.length)}
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Item
        </Button>
      </div>
      <div className='space-y-2'>
        {fields.map((field, index) => (
          <div key={field.id} className='flex items-center gap-2'>
            <GripVertical className='w-4 h-4 text-muted-foreground cursor-move' />
            <FormField
              control={form.control}
              name={`sequence.${index}`}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter sequence number or 'map'"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => remove(index)}
            >
              <Minus className='w-4 h-4' />
            </Button>
          </div>
        ))}
      </div>
      <FormMessage>{form.formState.errors.sequence?.message}</FormMessage>
    </div>
  );
}

function DurationsSection({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "durations",
  });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <FormLabel>Durations</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => append(0)}
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Duration
        </Button>
      </div>
      <div className='space-y-2'>
        {fields.map((field, index) => (
          <div key={field.id} className='flex items-center gap-2'>
            <FormField
              control={form.control}
              name={`durations.${index}`}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      step='0.1'
                      placeholder='Duration in seconds'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => remove(index)}
            >
              <Minus className='w-4 h-4' />
            </Button>
          </div>
        ))}
      </div>
      <FormMessage>{form.formState.errors.durations?.message}</FormMessage>
    </div>
  );
}

function TransitionsSection({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transitions",
  });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <FormLabel>Transitions</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => append({ type: "crossfade", duration: 0.5 })}
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Transition
        </Button>
      </div>
      <div className='space-y-2'>
        {fields.map((field, index) => (
          <div key={field.id} className='flex items-center gap-2'>
            <FormField
              control={form.control}
              name={`transitions.${index}.type`}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select transition type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='crossfade'>Crossfade</SelectItem>
                      <SelectItem value='fade'>Fade</SelectItem>
                      <SelectItem value='slide'>Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`transitions.${index}.duration`}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      step='0.1'
                      placeholder='Duration'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => remove(index)}
            >
              <Minus className='w-4 h-4' />
            </Button>
          </div>
        ))}
      </div>
      <FormMessage>{form.formState.errors.transitions?.message}</FormMessage>
    </div>
  );
}

function MusicSection({ form }: { form: any }) {
  return (
    <div className='space-y-4'>
      <FormLabel>Music Settings</FormLabel>
      <FormField
        control={form.control}
        name='music.path'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Music Path</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Enter music file path' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='music.volume'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume (0-1)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='number'
                  step='0.1'
                  min='0'
                  max='1'
                  placeholder='0.8'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='music.startTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time (seconds)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='number'
                  step='0.1'
                  min='0'
                  placeholder='0'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function useTemplateMutation(template: Template | null, onClose: () => void) {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, TemplateFormData>({
    mutationFn: async (data: TemplateFormData) => {
      const response = await fetch(
        `/api/admin/templates${template ? `/${template.id}` : ""}`,
        {
          method: template ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success(
        template
          ? "Template updated successfully"
          : "Template created successfully"
      );
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function EditTemplateDialog({
  template,
  open,
  onClose,
}: EditTemplateDialogProps) {
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      sequence: [],
      durations: [],
      music: {
        path: "",
        volume: 0.8,
        startTime: 0,
      },
      transitions: [],
      tiers: [],
      thumbnailUrl: "",
    },
  });

  const mutation = useTemplateMutation(template, onClose);
  const isSubmitting = mutation.isPending;

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name || "",
        description: template.description || "",
        sequence: template.sequence || [],
        durations: template.durations || [],
        music: template.music || {
          path: "",
          volume: 0.8,
          startTime: 0,
        },
        transitions: template.transitions || [],
        tiers: template.tiers || [],
        thumbnailUrl: template.thumbnailUrl || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        sequence: [],
        durations: [],
        music: {
          path: "",
          volume: 0.8,
          startTime: 0,
        },
        transitions: [],
        tiers: [],
        thumbnailUrl: "",
      });
    }
  }, [template, form]);

  const onSubmit = (data: TemplateFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create Template"}
          </DialogTitle>
          <DialogDescription>
            Configure the video template settings and sequence.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <ScrollArea className='max-h-[60vh] pr-4'>
              <div className='space-y-6'>
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

                <Separator />
                <SequenceSection form={form} />

                <Separator />
                <DurationsSection form={form} />

                <Separator />
                <MusicSection form={form} />

                <Separator />
                <TransitionsSection form={form} />

                <Separator />
                <TierCheckboxes form={form} />

                <FormField
                  control={form.control}
                  name='thumbnailUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className='flex justify-end gap-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

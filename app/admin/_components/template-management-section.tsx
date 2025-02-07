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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Template {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  isActive: boolean;
  subscriptionTier: string;
}

interface CreateTemplateInput {
  name: string;
  description: string;
  config: Record<string, any>;
  subscriptionTier: string;
}

async function getTemplates(): Promise<Template[]> {
  const response = await fetch("/api/admin/templates");
  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }
  return response.json();
}

async function createTemplate(input: CreateTemplateInput): Promise<Template> {
  const response = await fetch("/api/admin/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create template");
  }
  return response.json();
}

async function updateTemplate(
  id: string,
  input: Partial<Template>
): Promise<Template> {
  const response = await fetch(`/api/admin/templates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update template");
  }
  return response.json();
}

async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/admin/templates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete template");
  }
}

export default function TemplateManagementSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const createTemplateMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Template>) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      config: JSON.parse(formData.get("config") as string),
      subscriptionTier: formData.get("subscriptionTier") as string,
    };

    await createTemplateMutation.mutateAsync(data);
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await updateTemplateMutation.mutateAsync({
      id,
      isActive: !currentState,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTemplateMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Template Management</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
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
                <Label htmlFor='config'>Configuration (JSON)</Label>
                <Textarea id='config' name='config' required />
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
              <Button type='submit' disabled={createTemplateMutation.isPending}>
                {createTemplateMutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Create Template
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Subscription Tier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>{template.description}</TableCell>
              <TableCell>{template.subscriptionTier}</TableCell>
              <TableCell>
                <Switch
                  checked={template.isActive}
                  onCheckedChange={() =>
                    handleToggleActive(template.id, template.isActive)
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteTemplateMutation.isPending}
                >
                  {deleteTemplateMutation.isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type SafeTemplate = {
  id: string;
  name: string;
  description: string;
  sequence: unknown;
  durations: unknown;
  musicPath: string | null;
  musicVolume: number | null;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function TemplateManagementSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const { toast } = useToast();

  const utils = trpc.useContext();
  const { data: templates, isLoading } = trpc.adminPanel.getTemplates.useQuery(
    undefined,
    {
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const createTemplate = trpc.adminPanel.createTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      setIsOpen(false);
      utils.adminPanel.getTemplates.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTemplate = trpc.adminPanel.updateTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      utils.adminPanel.getTemplates.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTemplate = trpc.adminPanel.deleteTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      utils.adminPanel.getTemplates.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
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
      sequence: JSON.parse(formData.get("sequence") as string),
      durations: JSON.parse(formData.get("durations") as string),
      musicPath: formData.get("musicPath") as string,
      musicVolume: parseFloat(formData.get("musicVolume") as string) || 1.0,
      subscriptionTier: formData.get("subscriptionTier") as string,
      isActive: true,
    };

    createTemplate.mutate(data);
  };

  const handleToggleActive = (id: string, currentState: boolean) => {
    updateTemplate.mutate({
      id,
      isActive: !currentState,
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Template Management</h2>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Switch
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
              id='include-inactive'
            />
            <Label htmlFor='include-inactive'>Show Inactive</Label>
          </div>
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
                  <Textarea id='description' name='description' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='sequence'>Sequence (JSON)</Label>
                  <Textarea id='sequence' name='sequence' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='durations'>Durations (JSON)</Label>
                  <Textarea id='durations' name='durations' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='musicPath'>Music Path</Label>
                  <Input id='musicPath' name='musicPath' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='musicVolume'>Music Volume</Label>
                  <Input
                    id='musicVolume'
                    name='musicVolume'
                    type='number'
                    min='0'
                    max='1'
                    step='0.1'
                    defaultValue='1.0'
                  />
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
                <Button type='submit' disabled={createTemplate.isLoading}>
                  {createTemplate.isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Create Template
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
              <TableHead>Subscription Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {((templates as unknown as SafeTemplate[]) ?? []).map(
              (template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>{template.subscriptionTier}</TableCell>
                  <TableCell>
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={() =>
                        updateTemplate.mutate({
                          id: template.id,
                          isActive: !template.isActive,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => deleteTemplate.mutate({ id: template.id })}
                      disabled={deleteTemplate.isLoading}
                    >
                      {deleteTemplate.isLoading && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

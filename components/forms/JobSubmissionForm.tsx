"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateJob } from "@/hooks/use-jobs";
import { useTemplates } from "@/hooks/queries/use-templates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobSubmissionFormProps {
  listingId: string;
  onSuccess?: () => void;
  userTier?: string;
}

export const JobSubmissionForm = ({
  listingId,
  onSuccess,
  userTier = "free",
}: JobSubmissionFormProps) => {
  const [template, setTemplate] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const createJob = useCreateJob();
  const { data: templates, isLoading } = useTemplates(userTier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!template) {
      toast.error("Please select a template");
      return;
    }

    try {
      await createJob.mutateAsync({
        listingId,
        template,
        inputFiles: files,
      });

      toast.success("Job submitted successfully");
      onSuccess?.();
    } catch (error) {
      console.error("[SUBMIT_JOB_ERROR]", error);
      toast.error("Failed to submit job");
    }
  };

  if (isLoading) {
    return (
      <Card className='p-6 flex justify-center'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='template'>Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue placeholder='Select a template' />
            </SelectTrigger>
            <SelectContent>
              {templates?.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='files'>Files</Label>
          <input
            id='files'
            type='file'
            multiple
            className='w-full'
            onChange={(e) => {
              const fileList = e.target.files;
              if (fileList) {
                setFiles(Array.from(fileList).map((file) => file.name));
              }
            }}
            required
          />
        </div>

        <Button type='submit' className='w-full' disabled={createJob.isPending}>
          {createJob.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Submitting...
            </>
          ) : (
            "Submit Job"
          )}
        </Button>
      </form>
    </Card>
  );
};

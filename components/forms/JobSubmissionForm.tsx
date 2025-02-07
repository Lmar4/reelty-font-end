"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateJob } from "@/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface JobSubmissionFormProps {
  listingId: string;
  onSuccess?: () => void;
}

export const JobSubmissionForm = ({
  listingId,
  onSuccess,
}: JobSubmissionFormProps) => {
  const [template, setTemplate] = useState("basic");
  const [files, setFiles] = useState<string[]>([]);

  const createJob = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="template">Template</Label>
          <Input
            id="template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="files">Files</Label>
          <Input
            id="files"
            type="file"
            multiple
            onChange={(e) => {
              const fileList = e.target.files;
              if (fileList) {
                setFiles(Array.from(fileList).map((file) => file.name));
              }
            }}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createJob.isPending}
        >
          {createJob.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

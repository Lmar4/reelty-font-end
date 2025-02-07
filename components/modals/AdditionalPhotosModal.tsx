"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateJob } from "@/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AdditionalPhotosModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdditionalPhotosModal = ({
  listingId,
  isOpen,
  onClose,
  onSuccess,
}: AdditionalPhotosModalProps) => {
  const [template, setTemplate] = useState("basic");
  const [files, setFiles] = useState<string[]>([]);

  const createJob = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please select at least one photo");
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
      onClose();
    } catch (error) {
      console.error("[SUBMIT_JOB_ERROR]", error);
      toast.error("Failed to submit job");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Additional Photos</DialogTitle>
        </DialogHeader>

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
            <Label htmlFor="files">Photos</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const fileList = e.target.files;
                if (fileList) {
                  setFiles(Array.from(fileList).map((file) => file.name));
                }
              }}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
